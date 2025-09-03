import { auth0 } from "@/app/lib/auth0";

export default async function Page(){
  const session = await auth0.getSession();

  async function fetchTest(){
    const response = await fetch("http://localhost:8000/api/v1/test", {
      headers: {
        Authorization: `Bearer ${session?.tokenSet.accessToken}`
      }
    });
    const data = await response.json();
    console.log(data);
  }
  fetchTest();

  async function createTest(){
    const response = await fetch("http://localhost:8000/api/v1/test", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.tokenSet.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ description: "New Test" })
    });
    const data = await response.json();
    console.log(data);
  }
  createTest();

  if (!session) {
    return (
      <div>no session</div>
    );
  }

  return(
    <div>has session</div>
  )
}