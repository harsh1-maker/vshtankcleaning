# VSH Tank Cleaning — no-credentials deployment

The site loads and serves its homepage without Razorpay credentials. Razorpay is initialized lazily only when the payment API is called. If credentials are absent, the payment endpoint returns a clear 503 response instead of crashing the Vercel function.
