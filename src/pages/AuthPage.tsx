 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Car, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useAuth } from '@/hooks/useAuth';
 import { lovable } from '@/integrations/lovable/index';
 import { toast } from 'sonner';
 import { z } from 'zod';
 
 const emailSchema = z.string().email('Please enter a valid email');
 const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
 
 const AuthPage = () => {
   const navigate = useNavigate();
   const { user, loading: authLoading } = useAuth();
   const [isLogin, setIsLogin] = useState(true);
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [googleLoading, setGoogleLoading] = useState(false);
   
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [name, setName] = useState('');
   const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
 
   const { signIn, signUp } = useAuth();
 
   // Redirect if already logged in
   useEffect(() => {
     if (user && !authLoading) {
       navigate('/', { replace: true });
     }
   }, [user, authLoading, navigate]);
 
   const validateForm = () => {
     const newErrors: { email?: string; password?: string } = {};
     
     const emailResult = emailSchema.safeParse(email);
     if (!emailResult.success) {
       newErrors.email = emailResult.error.errors[0].message;
     }
     
     const passwordResult = passwordSchema.safeParse(password);
     if (!passwordResult.success) {
       newErrors.password = passwordResult.error.errors[0].message;
     }
     
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!validateForm()) return;
     
     setLoading(true);
     
     try {
       if (isLogin) {
         const { error } = await signIn(email, password);
         if (error) {
           if (error.message.includes('Invalid login credentials')) {
             toast.error('Invalid email or password');
           } else if (error.message.includes('Email not confirmed')) {
             toast.error('Please verify your email before signing in');
           } else {
             toast.error(error.message);
           }
         } else {
           toast.success('Welcome back!');
           navigate('/', { replace: true });
         }
       } else {
         const { data, error } = await signUp(email, password);
         if (error) {
           if (error.message.includes('already registered')) {
             toast.error('This email is already registered. Please sign in.');
           } else {
             toast.error(error.message);
           }
         } else if (data.user && !data.session) {
           toast.success('Check your email to verify your account!');
         } else {
           toast.success('Account created successfully!');
           navigate('/', { replace: true });
         }
       }
     } catch (error: any) {
       toast.error('Something went wrong. Please try again.');
     } finally {
       setLoading(false);
     }
   };
 
   const handleGoogleSignIn = async () => {
     setGoogleLoading(true);
     try {
       const { error } = await lovable.auth.signInWithOAuth('google', {
         redirect_uri: window.location.origin,
       });
       if (error) {
         toast.error('Google sign-in failed. Please try again.');
       }
     } catch (error) {
       toast.error('Google sign-in failed. Please try again.');
     } finally {
       setGoogleLoading(false);
     }
   };
 
   if (authLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5 flex flex-col">
       {/* Animated Background Elements */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
       </div>
 
       {/* Content */}
       <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
         {/* Logo & Title */}
         <div className="text-center mb-8 animate-fade-in">
           <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
             <Car className="w-10 h-10 text-primary-foreground" />
           </div>
           <h1 className="text-3xl font-bold text-foreground mb-2">Pick & Drop</h1>
           <p className="text-muted-foreground">Manage your rides with ease</p>
         </div>
 
         {/* Auth Card */}
         <div className="w-full max-w-sm animate-scale-in" style={{ animationDelay: '0.1s' }}>
           <div className="bg-card rounded-3xl shadow-xl border border-border p-6 space-y-6">
             {/* Tab Switcher */}
             <div className="flex bg-muted rounded-xl p-1">
               <button
                 onClick={() => setIsLogin(true)}
                 className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                   isLogin 
                     ? 'bg-card shadow-sm text-foreground' 
                     : 'text-muted-foreground hover:text-foreground'
                 }`}
               >
                 Sign In
               </button>
               <button
                 onClick={() => setIsLogin(false)}
                 className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                   !isLogin 
                     ? 'bg-card shadow-sm text-foreground' 
                     : 'text-muted-foreground hover:text-foreground'
                 }`}
               >
                 Sign Up
               </button>
             </div>
 
             {/* Google Sign In */}
             <Button
               variant="outline"
               size="lg"
               className="w-full h-14 text-base"
               onClick={handleGoogleSignIn}
               disabled={googleLoading}
             >
               {googleLoading ? (
                 <Loader2 className="w-5 h-5 mr-2 animate-spin" />
               ) : (
                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                   <path
                     fill="currentColor"
                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                   />
                   <path
                     fill="currentColor"
                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                   />
                   <path
                     fill="currentColor"
                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                   />
                   <path
                     fill="currentColor"
                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                   />
                 </svg>
               )}
               Continue with Google
             </Button>
 
             {/* Divider */}
             <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-border" />
               </div>
               <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
               </div>
             </div>
 
             {/* Form */}
             <form onSubmit={handleSubmit} className="space-y-4">
               {!isLogin && (
                 <div className="space-y-2 animate-fade-in">
                   <Label htmlFor="name" className="text-sm font-medium">
                     Full Name
                   </Label>
                   <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                     <Input
                       id="name"
                       type="text"
                       placeholder="John Doe"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="pl-10 h-12"
                     />
                   </div>
                 </div>
               )}
 
               <div className="space-y-2">
                 <Label htmlFor="email" className="text-sm font-medium">
                   Email
                 </Label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   <Input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => {
                       setEmail(e.target.value);
                       if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                     }}
                     className={`pl-10 h-12 ${errors.email ? 'border-destructive' : ''}`}
                   />
                 </div>
                 {errors.email && (
                   <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="password" className="text-sm font-medium">
                   Password
                 </Label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                   <Input
                     id="password"
                     type={showPassword ? 'text' : 'password'}
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => {
                       setPassword(e.target.value);
                       if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                     }}
                     className={`pl-10 pr-10 h-12 ${errors.password ? 'border-destructive' : ''}`}
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                   >
                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                 </div>
                 {errors.password && (
                   <p className="text-xs text-destructive animate-fade-in">{errors.password}</p>
                 )}
               </div>
 
               <Button
                 type="submit"
                 size="lg"
                 className="w-full h-14 text-lg gradient-primary"
                 disabled={loading}
               >
                 {loading ? (
                   <>
                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                     {isLogin ? 'Signing in...' : 'Creating account...'}
                   </>
                 ) : (
                   isLogin ? 'Sign In' : 'Create Account'
                 )}
               </Button>
             </form>
           </div>
 
           {/* Footer */}
           <p className="text-center text-sm text-muted-foreground mt-6">
             {isLogin ? "Don't have an account? " : "Already have an account? "}
             <button
               onClick={() => setIsLogin(!isLogin)}
               className="text-primary font-semibold hover:underline"
             >
               {isLogin ? 'Sign Up' : 'Sign In'}
             </button>
           </p>
         </div>
       </div>
     </div>
   );
 };
 
 export default AuthPage;