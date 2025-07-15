import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCog, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  roles: string[];
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get profiles with user roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          email,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles?.map(profile => {
        const roles = userRoles?.filter(role => role.user_id === profile.user_id).map(role => role.role) || [];
        return {
          id: profile.user_id,
          email: profile.email || '',
          display_name: profile.display_name,
          created_at: profile.created_at,
          roles
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'user', action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role }]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `${role} role added successfully.`,
        });
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `${role} role removed successfully.`,
        });
      }
      
      loadUsers();
      setRoleDialogOpen(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleAddRole = () => {
    if (selectedUser) {
      updateUserRole(selectedUser.id, newRole, 'add');
    }
  };

  const handleRemoveRole = (userId: string, role: 'admin' | 'user') => {
    updateUserRole(userId, role, 'remove');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          Manage user accounts and their roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.display_name || 'Not set'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === 'admin' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {role}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => handleRemoveRole(user.id, role as 'admin' | 'user')}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                      {user.roles.length === 0 && (
                        <span className="text-muted-foreground text-sm">No roles</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <UserCog className="w-4 h-4 mr-1" />
                          Manage Roles
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage User Roles</DialogTitle>
                          <DialogDescription>
                            Add or remove roles for {selectedUser?.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Add Role</Label>
                            <div className="flex gap-2">
                              <Select value={newRole} onValueChange={(value: 'admin' | 'user') => setNewRole(value)}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button onClick={handleAddRole}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Current Roles</Label>
                            <div className="space-y-2">
                              {selectedUser?.roles.map((role) => (
                                <div key={role} className="flex items-center justify-between p-2 border rounded">
                                  <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                                    {role}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveRole(selectedUser.id, role as 'admin' | 'user')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              {selectedUser?.roles.length === 0 && (
                                <p className="text-muted-foreground text-sm">No roles assigned</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExtendedUserRole extends UserRole {
  created_at: string;
  profiles?: {
    email: string;
    display_name: string | null;
  };
}

export function UserRolesManager() {
  const [roles, setRoles] = useState<ExtendedUserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name');

      if (profilesError) throw profilesError;

      // Combine the data
      const rolesWithProfiles = userRoles?.map(role => ({
        ...role,
        profiles: profiles?.find(profile => profile.user_id === role.user_id)
      })) || [];

      setRoles(rolesWithProfiles);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: "Error",
        description: "Failed to load user roles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Roles</CardTitle>
        <CardDescription>
          Overview of all user role assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((roleAssignment) => (
                <TableRow key={roleAssignment.id}>
                   <TableCell>
                     <div>
                       <div className="font-medium">
                         {roleAssignment.profiles?.email || 'Unknown'}
                       </div>
                       <div className="text-sm text-muted-foreground">
                         {roleAssignment.profiles?.display_name || 'No display name'}
                       </div>
                     </div>
                   </TableCell>
                   <TableCell>
                     <Badge variant={roleAssignment.role === 'admin' ? 'default' : 'secondary'}>
                       {roleAssignment.role}
                     </Badge>
                   </TableCell>
                   <TableCell>
                     {new Date(roleAssignment.created_at).toLocaleDateString()}
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}