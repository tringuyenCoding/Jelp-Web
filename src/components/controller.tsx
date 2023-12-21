"use server";

import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import React from "react";
import { UserResponse } from "@supabase/supabase-js";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Jobapplied } from "./cardjobapplied";

export async function getJob(formData: FormData) {
  "use server";
  // get user
  // const cookieStore = cookies();
  const supabase = createServerComponentClient({cookies});
  // filter value
  const location = formData.get("location") as string;
  const type = formData.get("type") as string;
  const experience = formData.get("experience") as string;
  const salary = formData.get("salary") as string;
  // compose query
  let query = supabase.from("Job").select("*");
  if (location != "All") {
    query = query.eq("location", location);
  }
  if (type != "%") {
    query = query.eq("type", type);
  }
  if (experience != "%") {
    query = query.eq("experience", experience);
  }
  if (salary != "%") {
    query = query.eq("salary", salary);
  }
  // get job
  const { data: jobs, error } = await query;
  if (error) {
    return null;
  }
  return jobs;
}

export async function saveJob(job_id: string) {
  "use server";
  // const cookieStore = cookies();
  // const supabase = createClient(cookieStore);
  const supabase = createServerComponentClient({cookies});
  const user = (await supabase.auth.getSession()).data.session?.user.id;
  if (!user) {
    return false;
  }
  const { data, error } = await supabase.from("SaveJob").insert([
    {
      employee_id: user as string,
      job_id: job_id,
    },
  ]);
  if (error) {
    console.log(error);
  } else {
    console.log("Success", data);
  }
  return true;
}

export async function postJob(
  formData1: FormData,
  formData2: FormData,
  user: UserResponse["data"]
) {
  "use server";
  // get user
  const cookieStore = cookies();
  const supabase = createClient();
  const employerData = await supabase
    .from("Employer")
    .select("*")
    .eq("user_id", user.user?.id)
    .single();
  const employer_name = employerData.data.name;
  const employer_logo = employerData.data.logo;
  const { data, error } = await supabase.from("Job").insert([
    {
      employer_id: user.user?.id,
      name: formData1.get("name"),
      employer_name: employer_name,
      employer_logo: employer_logo ?? "",
      status: "open",
      location: formData1.get("location"),
      salary: formData2.get("salary"),
      type: formData1.get("type"),
      content: formData2.get("content"),
      experience: formData2.get("exp"),
      workplace: formData1.get("workplace"),
      requirements: formData2.get("requirements"),
      benefits: formData2.get("benefits"),
    },
  ]);
  if (error) {
    console.log(error);
  } else {
    console.log("Success", data);
  }
}

export async function addEmployee(
  formData: FormData,
  dob: Date,
  user: UserResponse["data"]
) {
  "use server";
  const supabase = createServerComponentClient({cookies});

  console.log(user);
  const { data, error } = await supabase.from("Employee").insert([
    {
      user_id: user.user?.id,
      logo: "",
      name: formData.get("name"),
      location: formData.get("location"),
      dob: dob,
    },
  ]);
  if (error) {
    console.log(error);
  } else {
    console.log("Success", data);
  }
  return error;
}

export async function fetchData(function_query: string, customTag: string) {
  "use server"
  const supabase = createServerComponentClient({cookies});
  const currentuser = await supabase.auth.getUser()

  if(currentuser.data){
    const {data,error} = await supabase.rpc(function_query,{userid: currentuser.data.user?.id})

  if(error){
      return []
  }

  const results: Jobapplied[] = data.map((item:Jobapplied) =>({
      job_id: item.job_id,
      name: item.name,
      employer_name: item.employer_name,
      location: item.location,
      type: item.type,
      employer_logo: item.employer_logo,
      tag:customTag,
      post_time:new Date(item.post_time).toLocaleDateString()}))
  
  return results;
  }
  return []
  
}
export async function is_user(){
  "use server"
  const supabase = createServerComponentClient({cookies});
  const currentuser = await supabase.auth.getUser();
  if(currentuser.data)
  {
      const employer = await supabase
      .schema('public')
      .from('User')
      .select('type')
      .eq("user_id", currentuser.data.user?.id)
      .single()

      if(employer.data)
      {
        if(employer.data.type==='null')
        {
          return false;
        }

        if(employer.data.type ==="employer")
        {
          return false;
        }

        return true;
        
      }
      else{
        // case not account in User table
        return false;
      }
     
  }
  return false;
}