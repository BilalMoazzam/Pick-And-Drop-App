 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { LogOut, User, ChevronDown } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 
 export function UserMenu() {
   const { user, signOut } = useAuth();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
 
   const handleSignOut = async () => {
     setLoading(true);
     try {
       const { error } = await signOut();
       if (error) {
         toast.error('Failed to sign out');
       } else {
         toast.success('Signed out successfully');
         navigate('/auth', { replace: true });
       }
     } catch (error) {
       toast.error('Failed to sign out');
     } finally {
       setLoading(false);
     }
   };
 
   const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
   const initials = displayName.slice(0, 2).toUpperCase();
 
   return (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant="ghost" size="sm" className="h-10 gap-2 px-2">
           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
             {user?.user_metadata?.avatar_url ? (
               <img 
                 src={user.user_metadata.avatar_url} 
                 alt={displayName}
                 className="w-8 h-8 rounded-full object-cover"
               />
             ) : (
               <span className="text-xs font-bold text-primary">{initials}</span>
             )}
           </div>
           <ChevronDown className="w-4 h-4 text-muted-foreground" />
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="w-56">
         <div className="px-2 py-2">
           <p className="font-medium text-sm truncate">{displayName}</p>
           <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
         </div>
         <DropdownMenuSeparator />
         <DropdownMenuItem 
           onClick={handleSignOut}
           disabled={loading}
           className="text-destructive focus:text-destructive cursor-pointer"
         >
           <LogOut className="w-4 h-4 mr-2" />
           {loading ? 'Signing out...' : 'Sign Out'}
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   );
 }