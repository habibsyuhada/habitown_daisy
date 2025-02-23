import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import NextAuth from 'next-auth';
import { decode } from 'jsonwebtoken';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable');
}

const secret = process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: secret,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 hour
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        isTokenAuth: { label: 'Is Token Auth', type: 'boolean' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        // Handle token-based authentication
        if (credentials.isTokenAuth === 'true' && credentials.token) {
          try {
            console.log('Attempting to decode token');
            console.log('Received token:', credentials.token);

            // Just decode the token without verification
            const decoded = decode(credentials.token) as {
              id: string;
              email: string;
              name?: string;
            };

            if (!decoded || !decoded.email) {
              throw new Error('Invalid token format');
            }

            console.log('Decoded token:', decoded);

            const user = await prisma.user.findUnique({
              where: {
                email: decoded.email,
              },
            });

            if (!user) {
              console.log('Creating new user with data:', {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name || decoded.email.split('@')[0],
              });

              // Create user if doesn't exist
              const newUser = await prisma.user.create({
                data: {
                  id: decoded.id,
                  email: decoded.email,
                  name: decoded.name || decoded.email.split('@')[0],
                  updatedAt: new Date(),
                },
              });

              console.log('New user created:', newUser);
              return {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
              };
            }

            console.log('Existing user found:', user);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          } catch (error) {
            console.error('Token processing failed. Error details:', error);
            if (error instanceof Error) {
              throw new Error(`Token processing failed: ${error.message}`);
            }
            throw new Error('Token processing failed');
          }
        }

        // Handle regular password-based authentication
        if (!credentials.password) {
          throw new Error('Password is required');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error('Email does not exist');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
  },
  debug: true, // Enable debug logs
};

// Export the NextAuth handler
export default NextAuth(authOptions);