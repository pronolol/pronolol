import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: "http://192.168.1.116:3000",
    plugins: [
        expoClient({
            scheme: "pronolol",
            storagePrefix: "pronolol",
            storage: SecureStore,
        })
    ]
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    $fetch,
} = authClient;