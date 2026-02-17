import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-xl w-80 space-y-4">
        <h1 className="text-white text-xl font-bold">Register</h1>

        <input
          className="w-full p-2 bg-zinc-800 text-white rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full p-2 bg-zinc-800 text-white rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button className="w-full bg-pink-600 py-2 rounded text-white">
          Create account
        </button>
      </form>
    </div>
  )
}
