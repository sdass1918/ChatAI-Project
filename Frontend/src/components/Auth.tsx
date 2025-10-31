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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!otpSent) {
        // Step 1: Initiate signin with email
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

        setOtpSent(true);
        setError("");
      } 
      if(otpSent) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ChatAI</h1>
          <p className="text-gray-300">
            {otpSent ? "Enter the OTP sent to your email" : "Welcome back"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message for OTP */}
        {otpSent && !error && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-6">
            <p className="text-green-200 text-sm">
              OTP sent to your email. Please check your inbox.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Enter your email"
            />
          </div>

          {/* OTP field for sign in when OTP is sent */}
          {otpSent && (
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-300 mb-2"
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter 6-digit OTP"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
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

        {/* Back to email entry for OTP flow */}
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

        {/* Info message - only show when not in OTP flow */}
        {!otpSent && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-gray-400 text-center">
              Enter your email to receive an OTP for sign in
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
