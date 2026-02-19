1. Use type any but validate with Zod, less code to maintain (i know it's controversial)
2. Always throw complete ERROR not part of it, will have good context about the error
3. Never trust client input for identity
4. one validation file, use it inside controller for parameter check and early exit, and rest inside service file
