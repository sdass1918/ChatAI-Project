import React, { useState } from "react";

interface AuthProps {
  onAuthenticated: (user: { id: string; email: string; token: string }) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [fetchedOtp, setFetchedOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!otpSent) {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/initiate_signin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send OTP");
        }
        setFetchedOtp(data.otp);
        setOtpSent(true);
        setError("");
      } else if (otpSent) {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/signin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, otp }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Authentication failed");
        }

        localStorage.setItem("authToken", data.token);
        onAuthenticated({
          id: data.userId,
          email: data.email || email,
          token: data.token,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 text-gray-300">
      <div className="bg-[#171717] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#2f2f2f]">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ChatAI</h1>
          <p className="text-gray-400">
            {otpSent ? "Enter the OTP sent to your email" : "Welcome back"}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {otpSent && !error && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 mb-6">
            <p className="text-green-300 text-sm">
              {/* OTP sent to your email. Please check your inbox. */}
              The OTP for testing purposes is: <strong>{fetchedOtp}</strong>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={otpSent}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#4f4f4f] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Enter your email"
            />
          </div>

          {otpSent && (
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#4f4f4f] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter 6-digit OTP"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{otpSent ? "Verifying OTP..." : "Sending OTP..."}</span>
              </div>
            ) : (
              <span>{otpSent ? "Verify & Sign In" : "Send OTP"}</span>
            )}
          </button>
        </form>

        {otpSent && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
              }}
              className="text-blue-400 hover:text-blue-300 font-medium underline text-sm"
            >
              ← Back to email entry
            </button>
          </div>
        )}

        {!otpSent && (
          <div className="mt-6 p-4 bg-[#2a2a2a]/50 rounded-lg border border-[#2f2f2f]">
            <p className="text-sm text-gray-400 text-center">
              Enter your email to receive an OTP for sign in
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
