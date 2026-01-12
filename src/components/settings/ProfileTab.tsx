import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface ProfileTabProps {
  user: User | null;
  name: string;
  setName: (name: string) => void;
  loading: boolean;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  changingPassword: boolean;
  onUpdateProfile: () => void;
  onChangePassword: () => void;
  onSignOut: () => void;
}

export const ProfileTab = ({
  user,
  name,
  setName,
  loading,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  changingPassword,
  onUpdateProfile,
  onChangePassword,
  onSignOut
}: ProfileTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize seus dados pessoais e de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              O e-mail não pode ser alterado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <Button onClick={onUpdateProfile} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Atualize sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
            />
          </div>

          <Button
            onClick={onChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
          >
            {changingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Alterando...
              </>
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            onClick={onSignOut}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
