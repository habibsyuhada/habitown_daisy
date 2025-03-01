import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import { decode } from 'jsonwebtoken';
import { supabase, createAdminClient } from '@/lib/supabase';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable');
}

const secret = process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
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

            const supabaseAdmin = createAdminClient();
            // Check if user exists in Supabase auth by email
            const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();

            if (userError) {
              console.error('Error fetching users:', userError);
              throw new Error('Error fetching users');
            }

            const existingUser = users.users.find(u => u.email === decoded.email);

            if (!existingUser) {
              console.log('Creating new user with data:', {
                email: decoded.email,
                name: decoded.name || decoded.email.split('@')[0],
              });

              // Create user if doesn't exist
              const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: decoded.email,
                email_confirm: true,
                user_metadata: {
                  name: decoded.name || decoded.email.split('@')[0],
                },
                app_metadata: {
                  provider: 'external',
                }
              });

              if (createError || !newUser.user) {
                console.error('Error creating user:', createError);
                throw new Error('Error creating user');
              }

              console.log('New user created:', newUser.user);
              return {
                id: newUser.user.id,
                email: newUser.user.email!,
                name: newUser.user.user_metadata?.name,
              };
            }

            console.log('Existing user found:', existingUser);
            return {
              id: existingUser.id,
              email: existingUser.email!,
              name: existingUser.user_metadata?.name,
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

        // Sign in with email and password
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (signInError || !data.user) {
          throw new Error('Invalid email or password');
        }

        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name,
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