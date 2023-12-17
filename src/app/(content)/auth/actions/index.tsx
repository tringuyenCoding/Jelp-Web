"use server"
import {createClient} from "@/utils/supabase/server"

export async function signUpWithEmailAndPassword(data: {
    email: string;
    password: string;
    confirm: string;
}) {
    const supabase = await createClient();

    const result = await supabase.auth.signUp({email: data.email, password: data.password});


    return JSON.stringify(result)

}

