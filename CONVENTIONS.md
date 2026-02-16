<!-- AI DO NOT MODIFY THIS FILE -->

1. Use type any but validate with Zod, less code to maintain
2. Always throw complete ERROR not part of it, will have good context about the error
3. Never trust client input for identity
4. Req body first not Params. Params is not scalable
5. Before calling the function check the parameters
6. 