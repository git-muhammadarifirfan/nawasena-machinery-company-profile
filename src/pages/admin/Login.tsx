import React, { useState } from "react";
import { Container } from "../../ui/Container";
import { Card, CardBody } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { useAuth } from "../../state/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../ui/Toast";

export default function AdminLogin() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      nav("/admin", { replace: true });
    } catch (err: any) {
      toast.push({ kind: "err", title: "Login gagal", desc: err?.message ?? "Cek email/password." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-14">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <div className="mt-1 text-sm text-white/60">Masuk untuk mengelola produk & pengaturan.</div>

        <Card className="mt-6">
          <CardBody>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <div className="mb-1 text-xs text-white/70">Email</div>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.id" type="email" />
              </div>
              <div>
                <div className="mb-1 text-xs text-white/70">Password</div>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
              </div>
              <Button className="h-11 w-full" disabled={loading} type="submit">{loading ? "Masuk…" : "Masuk"}</Button>
            </form>
            <div className="mt-4 text-[11px] text-white/50">
              Tips: catat password dan email mu. <b>developer</b>.
            </div>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
