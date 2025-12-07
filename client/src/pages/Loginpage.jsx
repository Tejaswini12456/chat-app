import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Authcontext } from "../../context/Authcontext";
import assets from "../assets/assets";

const LoginPage = () => {
  const { login, signup, authUser, isLoading } = useContext(Authcontext);
  const navigate = useNavigate();

  const [currentState, setCurrentState] = useState("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [agree, setAgree] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  // Navigate if already logged in
  useEffect(() => {
    if (authUser) navigate("/", { replace: true });
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentState === "signup") {
        if (!agree) {
          alert("You must agree to the Terms & Policy");
          return;
        }
        const { success, user } = await signup(fullName, email, password, bio);
        if (success) console.log("Welcome,", user?.name);
      } else {
        const { success, user } = await login(email, password);
        if (success) {
          console.log("Welcome,", user?.name);
          if (rememberMe) {
            localStorage.setItem("savedEmail", email);
            localStorage.setItem("savedPassword", password);
          } else {
            localStorage.removeItem("savedEmail");
            localStorage.removeItem("savedPassword");
          }
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const toggleState = () => {
    setCurrentState(currentState === "signup" ? "login" : "signup");
    setFullName("");
    if (!rememberMe) {
      setEmail("");
      setPassword("");
    }
    setBio("");
    setAgree(false);
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 max-sm:flex-col backdrop-blur-2xl">
      <img src={assets.logo_big} alt="Logo" className="w-[min(30vw,250px)]" />

      <form
        onSubmit={handleSubmit}
        className="border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-4 rounded-lg shadow-lg w-[min(80vw,350px)]"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currentState === "signup" ? "Sign Up" : "Login"}
          <img
            src={assets.arrow_icon}
            alt="Arrow"
            className="w-5 cursor-pointer rotate-180 hover:scale-110 transition"
            onClick={toggleState}
          />
        </h2>

        {authUser && (
          <p className="text-green-400 font-medium">
            Welcome, {authUser.name}!
          </p>
        )}

        {currentState === "signup" && (
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="p-2 border border-gray-500 rounded-md bg-transparent"
            required
          />
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 border border-gray-500 rounded-md bg-transparent"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-2 border border-gray-500 rounded-md bg-transparent"
          required
        />

        {currentState === "signup" && (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short Bio"
              rows={3}
              className="p-2 border border-gray-500 rounded-md bg-transparent"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="accent-indigo-600"
              />
              <span>
                I agree to the{" "}
                <a className="text-indigo-400 hover:underline">Terms & Policy</a>
              </span>
            </label>
          </>
        )}

        {currentState === "login" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-indigo-600"
            />
            <span>Remember me</span>
          </label>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`bg-indigo-600 hover:bg-indigo-700 rounded-md py-2 font-medium ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading
            ? currentState === "signup"
              ? "Creating..."
              : "Logging in..."
            : currentState === "signup"
            ? "Create Account"
            : "Login"}
        </button>

        <p className="text-center text-sm text-gray-300">
          {currentState === "signup" ? (
            <>
              Already have an account?{" "}
              <span
                className="text-indigo-400 cursor-pointer hover:underline"
                onClick={toggleState}
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                className="text-indigo-400 cursor-pointer hover:underline"
                onClick={toggleState}
              >
                Sign up here
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;