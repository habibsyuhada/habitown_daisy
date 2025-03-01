import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please set NEXTAUTH_SECRET environment variable');
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
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        token: { label: 'Token', type: 'text' },
        isTokenAuth: { label: 'Is Token Auth', type: 'text' },
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

            const decoded = jwt.verify(credentials.token, process.env.SUPABASE_JWT_SECRET!) as JwtPayload;

            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Check if user exists
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', decoded.sub)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
              throw new Error(fetchError.message);
            }

            if (!existingUser) {
              // Create new user
              const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: decoded.email,
                email_confirm: true,
                user_metadata: {
                  full_name: decoded.name,
                  avatar_url: decoded.picture,
                },
                id: decoded.sub,
              });

              if (createError) {
                throw new Error(createError.message);
              }

              // Insert into users table
              const { error: insertError } = await supabase
                .from('users')
                .insert([
                  {
                    id: newUser.user.id,
                    email: newUser.user.email,
                    name: decoded.name,
                    avatar_url: decoded.picture,
                  },
                ]);

              if (insertError) {
                throw new Error(insertError.message);
              }

              return {
                id: newUser.user.id,
                email: newUser.user.email,
                name: decoded.name,
                image: decoded.picture,
              };
            }

            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              image: existingUser.avatar_url,
            };
          } catch (error) {
            console.error('Error in authorize:', error);
            throw error;
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