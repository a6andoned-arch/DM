import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type User = { id: number; username: string; email: string };
type Meme = {
  id: number;
  title: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
  userId: number;
  username: string;
};

type Battle = {
  id: number;
  status: string;
  memeAId: number;
  memeATitle: string;
  memeACaption: string;
  memeAImageUrl: string;
  memeAOwner: string;
  memeBId: number;
  memeBTitle: string;
  memeBCaption: string;
  memeBImageUrl: string;
  memeBOwner: string;
  votesA: number;
  votesB: number;
};

const neonStyles = {
  background: "radial-gradient(circle at 20% 20%, rgba(0,255,204,0.2), transparent 30%), radial-gradient(circle at 80% 0%, rgba(255,0,204,0.2), transparent 35%), #050510",
};

export default function MemeBattle() {
  const [token, setToken] = useState(localStorage.getItem("memeToken") || "");
  const [user, setUser] = useState<User | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);

  const [signup, setSignup] = useState({ username: "", email: "", password: "" });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [memeForm, setMemeForm] = useState({ title: "", caption: "", imageBase64: "" });
  const [battleForm, setBattleForm] = useState({ memeAId: "", memeBId: "" });

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadPublic = async () => {
    const [memeRes, battleRes] = await Promise.all([
      fetch("/api/meme/memes"),
      fetch("/api/meme/battles"),
    ]);
    setMemes(await memeRes.json());
    setBattles(await battleRes.json());
  };

  const loadMe = async (authToken = token) => {
    if (!authToken) return;
    const res = await fetch("/api/meme/me", { headers: { Authorization: `Bearer ${authToken}` } });
    if (res.ok) {
      setUser(await res.json());
    } else {
      setToken("");
      localStorage.removeItem("memeToken");
    }
  };

  useEffect(() => {
    loadPublic();
    loadMe();
  }, []);

  const onSignup = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/meme/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signup),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      localStorage.setItem("memeToken", data.token);
      setUser(data.user);
    } else {
      alert(data.message || "Signup failed");
    }
  };

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/meme/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      localStorage.setItem("memeToken", data.token);
      setUser(data.user);
    } else {
      alert(data.message || "Login failed");
    }
  };

  const handleImage = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMemeForm((prev) => ({ ...prev, imageBase64: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const onCreateMeme = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/meme/memes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(memeForm),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Meme upload failed");
    setMemeForm({ title: "", caption: "", imageBase64: "" });
    await loadPublic();
  };

  const onCreateBattle = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/meme/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ memeAId: Number(battleForm.memeAId), memeBId: Number(battleForm.memeBId) }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Battle create failed");
    setBattleForm({ memeAId: "", memeBId: "" });
    await loadPublic();
  };

  const vote = async (battleId: number, memeId: number) => {
    const res = await fetch(`/api/meme/battles/${battleId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ memeId }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Vote failed");
    await loadPublic();
  };

  return (
    <div className="space-y-8 rounded-2xl border border-cyan-300/20 p-6" style={neonStyles}>
      <section className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-cyan-300 [text-shadow:0_0_15px_#00f5d4]">Meme Battle Arena</h1>
        <p className="text-gray-300">Neon Auth + Neon DB + ImgBB upload. Drop your meme and fight for glory.</p>
      </section>

      {!user ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4 bg-black/50 border-fuchsia-400/30">
            <h2 className="text-fuchsia-300 font-semibold mb-4">Signup</h2>
            <form onSubmit={onSignup} className="space-y-3">
              <Input placeholder="username" value={signup.username} onChange={(e) => setSignup({ ...signup, username: e.target.value })} />
              <Input placeholder="email" type="email" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
              <Input placeholder="password" type="password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
              <Button className="w-full">Create account</Button>
            </form>
          </Card>
          <Card className="p-4 bg-black/50 border-cyan-400/30">
            <h2 className="text-cyan-300 font-semibold mb-4">Login</h2>
            <form onSubmit={onLogin} className="space-y-3">
              <Input placeholder="email" type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
              <Input placeholder="password" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
              <Button className="w-full">Enter Arena</Button>
            </form>
          </Card>
        </div>
      ) : (
        <>
          <Card className="p-4 bg-black/50 border-cyan-300/40">
            <p className="text-sm text-gray-300">Logged in as <span className="text-cyan-300">{user.username}</span></p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4 bg-black/50 border-emerald-400/30">
              <h3 className="text-emerald-300 font-semibold mb-3">Upload Meme (ImgBB)</h3>
              <form className="space-y-3" onSubmit={onCreateMeme}>
                <Input placeholder="Meme title" value={memeForm.title} onChange={(e) => setMemeForm({ ...memeForm, title: e.target.value })} />
                <Input placeholder="Caption" value={memeForm.caption} onChange={(e) => setMemeForm({ ...memeForm, caption: e.target.value })} />
                <Input type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0] || null)} />
                <Button className="w-full">Upload Meme</Button>
              </form>
            </Card>

            <Card className="p-4 bg-black/50 border-yellow-300/30">
              <h3 className="text-yellow-300 font-semibold mb-3">Create Battle</h3>
              <form className="space-y-3" onSubmit={onCreateBattle}>
                <Input placeholder="Meme A ID" value={battleForm.memeAId} onChange={(e) => setBattleForm({ ...battleForm, memeAId: e.target.value })} />
                <Input placeholder="Meme B ID" value={battleForm.memeBId} onChange={(e) => setBattleForm({ ...battleForm, memeBId: e.target.value })} />
                <Button className="w-full">Start Battle</Button>
              </form>
            </Card>
          </div>
        </>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">All Battles</h2>
        <div className="grid gap-5">
          {battles.map((battle) => (
            <Card key={battle.id} className="p-4 bg-black/60 border-white/20">
              <p className="text-xs text-gray-400 mb-3">Battle #{battle.id}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <img src={battle.memeAImageUrl} alt={battle.memeATitle} className="w-full h-64 object-cover rounded-lg" />
                  <div className="text-sm text-gray-200">#{battle.memeAId} {battle.memeATitle} • @{battle.memeAOwner}</div>
                  <div className="text-xs text-cyan-300">Votes: {battle.votesA}</div>
                  {user && <Button size="sm" onClick={() => vote(battle.id, battle.memeAId)}>Vote Meme A</Button>}
                </div>
                <div className="space-y-2">
                  <img src={battle.memeBImageUrl} alt={battle.memeBTitle} className="w-full h-64 object-cover rounded-lg" />
                  <div className="text-sm text-gray-200">#{battle.memeBId} {battle.memeBTitle} • @{battle.memeBOwner}</div>
                  <div className="text-xs text-fuchsia-300">Votes: {battle.votesB}</div>
                  {user && <Button size="sm" variant="secondary" onClick={() => vote(battle.id, battle.memeBId)}>Vote Meme B</Button>}
                </div>
              </div>
            </Card>
          ))}
          {battles.length === 0 && <p className="text-gray-400">No battles yet.</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-white">Meme Library</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memes.map((meme) => (
            <Card key={meme.id} className="p-3 bg-black/50 border-cyan-900/50">
              <img src={meme.imageUrl} alt={meme.title} className="w-full h-44 object-cover rounded" />
              <p className="text-cyan-300 text-xs mt-2">ID: {meme.id}</p>
              <h3 className="text-sm text-white font-semibold">{meme.title}</h3>
              <p className="text-xs text-gray-400">@{meme.username}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
