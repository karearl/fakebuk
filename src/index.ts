import { file } from "bun";
import {
  setupDatabase,
  getAllUsers,
  registerUser,
  checkPassword,
  getUserByFullName,
  getUserByEmail,
  checkEmailExists,
} from "./database";

setupDatabase()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error(err);
  });
const server = Bun.serve({
  async fetch(req: Request) {
    const url: URL = new URL(req.url);
    const path = url.pathname;
    const params: URLSearchParams = url.searchParams;
    // respond with text/html
    let onLoad: string = `
        window.onload = function() {
            // Check if the showMessage cookie is set
            if (document.cookie.split('; ').find(row => row.startsWith('showMessage='))) {
              // Display the message
              var message = document.createElement('p');
              message.textContent = 'Invalid email or username';
              document.body.appendChild(message);
          
              // Remove the showMessage cookie
              document.cookie = 'showMessage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
          };`;
    let loginForm: string = `<form action="/login" method="POST">
                    <div class="p-6 space-y-4">
                    <div class="space-y-2">
                        <input
                            class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            id="emailOrUsername"
                            name="username"
                            type="text"
                            placeholder="Enter your username or email"
                            />
                    </div>
                    <div class="space-y-2">
                        <input
                            class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            />
                    </div>
                    <button
                        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2 w-full">
                    Log In
                    </button>
            </form>`;
    let registrationForm: string = `<form action="/register" method="POST">
        <h3 class="text-2xl font-bold mb-4">Create an Account</h3>
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-x-4">
                <div>
                    <input id="firstName" name="firstName" type="text" placeholder="Enter your first name"
                        class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                </div>
                <div>
                    <input id="lastName" name="lastName" type="text" placeholder="Enter your last name"
                        class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                </div>
            </div>
            <div>
                <input id="newEmail" name="newEmail" type="email" placeholder="Enter your email"
                    class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
            </div>
            <div>
                <input id="newPassword" name="newPassword" type="password" placeholder="Enter your password"
                    class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm" for="birthday">Date of Birth</label>
                <input id="birthday" name="birthday" type="date"
                    class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
            </div>
            <div>
                <select id="gender" name="gender"
                    class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <button
                class="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50">Sign
            Up</button>
            </form>`;

    let body: BodyInit = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Login Page</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        </head>
        <body class="bg-purple-900 text-white flex justify-center items-center h-screen">
            <div class="rounded-lg border bg-white text-gray-800 shadow-sm w-full max-w-md space-y-6 p-6">
                ${loginForm}
                <script>
                    function showError() {
                    // Create the error message element
                    var error = document.createElement('p');
                    error.style.color = 'red';
                    error.textContent = 'Invalid username or password';
                    error.id = 'error';

                    // Insert the error message above the login form
                    var login = document.getElementById('login');
                    login.parentNode.insertBefore(error, login);

                    // Remove the error message after 5 seconds
                    setTimeout(function() {
                        error.parentNode.removeChild(error);
                    }, 5000);
                    }
                </script>
                <a href="javascript:void(0)" class="text-sm underline text-purple-600">Forgot Password?</a>
                <div class="text-center">
                <span class="text-sm">Don't have an account?</span>
                <a href="javascript:void(0)" onclick="toggleRegistrationForm()" class="text-sm font-medium text-purple-600 underline focus:outline-none">
                Create one!
                </a>
                </div>
                </div>
            </div>
            <div id="overlay" onclick="toggleRegistrationForm()" style="
                display: none;
                position: fixed;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 2;
                cursor: pointer;
                "></div>
            <div id="registrationForm"
                class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black px-8 py-6 rounded-lg shadow-md z-50"
                style="display: none;">
                ${registrationForm}
                <a href="javascript:void(0)" onclick="toggleRegistrationForm()"
                    class="inline-flex items-center justify-center w-full h-10 px-4 mt-2 text-sm font-medium text-purple-600 bg-transparent border border-purple-600 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50">Close</a>
                </div>
            </div>
            <script>
                function toggleRegistrationForm() {
                var registrationForm = document.getElementById("registrationForm");
                var overlay = document.getElementById("overlay");
                if (registrationForm.style.display === "none") {
                    registrationForm.style.display = "block";
                    overlay.style.display = "block";
                } else {
                    registrationForm.style.display = "none";
                    overlay.style.display = "none";
                }
                }
                ${onLoad}
            </script>
            
        </body>
        </html>
        `;

    if (path === "/") {
        return new Response(body, { headers: { "Content-Type": "text/html" } });
    }
      
    if (req.method === "POST" && path === "/register") {
      try {
        const data = await req.formData();
        const firstName = data.get("firstName");
        const lastName = data.get("lastName");
        const email = data.get("newEmail");
        const password = data.get("newPassword");
        const birthDate = data.get("birthday");
        const gender = data.get("gender");

        if (
          !firstName ||
          !lastName ||
          !email ||
          !password ||
          !birthDate ||
            !gender
        ) {
            return new Response("Missing required fields", { status: 400 });
            }

        const emailExists = await checkEmailExists(email as string);

        if (emailExists) {
          return Response.redirect("/");
        } else {
        await registerUser(
            email as FormDataEntryValue as string,
            password as FormDataEntryValue as string,
            firstName as FormDataEntryValue as string,
            lastName as FormDataEntryValue as string,
            birthDate as FormDataEntryValue as unknown as Date,
            gender as FormDataEntryValue as string
          );
          const user = await getUserByEmail(email as string);
          console.log(user?.getDataValue("UserID"));
          return Response.redirect("/users/" + firstName + "." + lastName + user?.getDataValue("UserID"));
        }
      } catch (err) {
        console.error(err);
        return new Response("An error occurred", { status: 500 });
      }
    }
    if (req.method === "POST" && path === "/login") {
      const data = await req.formData();
      const username = data.get("username");
      const password = data.get("password");

      if (!username || !password) {
        const response: Response = new Response(
          "Missing username or password",
          { status: 400 }
        );

        return Response.redirect("/#emailOrUsername");
      }
      const user = await checkPassword(
        username.toString(),
        password.toString()
      );
      if (user) {
        loginForm = ``;
        registrationForm = ``;
        

        return Response.redirect(
          "/users/" + user.get("FirstName") + "." + user.get("LastName") + user.get("UserID")
        );
      } else {
        body += `
                    <script>
                    window.onload = showError;
                    </script>
                `;
        return new Response(body, {
          headers: { "Content-Type": "text/html" },
          status: 401,
        });
      }
    }

    if (req.method === "GET" && path.startsWith("/users/")) {
      try {
        const name = path.split("/")[2];
        const [firstName, lastName] = name.split(".");

        // Validate input
        if (typeof firstName !== "string" || typeof lastName !== "string") {
          return new Response("Invalid input", { status: 400 });
        }

        const user = await getUserByFullName(firstName, lastName);
        if (!user) {
          return new Response("User not found", { status: 404 });
        }

        const body: BodyInit = `
                <h1>${user.get("FirstName")} ${user.get("LastName")}</h1>
                <p>Email: ${user.get("Email")}</p>
                <p>Birth Date: ${user.get("BirthDate")}</p>
                <p>Gender: ${user.get("Gender")}</p>
                `;

        return new Response(body, { headers: { "Content-Type": "text/html" } });
      } catch (err) {
        console.error(err);
        return new Response("An error occurred", { status: 500 });
      }
    }

    // 404s
    return new Response("Page not found", { status: 404 });
  },
});
console.log(`Listening on ${server.url}`);

// const app = new Hono()

// app.get('/', (c) => {
// setupDatabase().then(() => {
//     console.log('Database connected')
// }).catch((err) => {
//     console.error(err)
// })

//     return c.html(`
//     <!DOCTYPE html>
//     <html lang="en">
//         <head>
//             <meta charset="UTF-8" />
//             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//             <title>Login Page</title>
//             <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
//         </head>
//         <body class="bg-purple-900 text-white flex justify-center items-center h-screen">
//             <div class="rounded-lg border bg-white text-gray-800 shadow-sm w-full max-w-md space-y-6 p-6">
//             <form action="/login" method="POST">
//                 <div class="p-6 space-y-4">
//                 <div class="space-y-2">
//                     <input
//                         class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                         id="emailOrUsername"
//                         name="username"
//                         type="text"
//                         placeholder="Enter your username or email"
//                         />
//                 </div>
//                 <div class="space-y-2">
//                     <input
//                         class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                         id="password"
//                         name="password"
//                         type="password"
//                         placeholder="Enter your password"
//                         />
//                 </div>
//                 <button
//                     class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2 w-full">
//                 Log In
//                 </button>
//             </form>
//                 <a href="javascript:void(0)" class="text-sm underline text-purple-600">Forgot Password?</a>
//                 <div class="text-center">
//                 <span class="text-sm">Don't have an account?</span>
//                 <a href="javascript:void(0)" onclick="toggleRegistrationForm()" class="text-sm font-medium text-purple-600 underline focus:outline-none">
//                 Create one!
//                 </a>
//                 </div>
//                 </div>
//             </div>
//             <div id="overlay" onclick="toggleRegistrationForm()" style="
//                 display: none;
//                 position: fixed;
//                 width: 100%;
//                 height: 100%;
//                 top: 0;
//                 left: 0;
//                 right: 0;
//                 bottom: 0;
//                 background-color: rgba(0, 0, 0, 0.5);
//                 z-index: 2;
//                 cursor: pointer;
//                 "></div>
//             <div id="registrationForm"
//                 class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black px-8 py-6 rounded-lg shadow-md z-50"
//                 style="display: none;">
//                 <form action="/register" method="POST">
//                     <h3 class="text-2xl font-bold mb-4">Create an Account</h3>
//                     <div class="space-y-4">
//                         <div class="grid grid-cols-2 gap-x-4">
//                             <div>
//                                 <input id="firstName" name="firstName" type="text" placeholder="Enter your first name"
//                                     class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
//                             </div>
//                             <div>
//                                 <input id="lastName" name="lastName" type="text" placeholder="Enter your last name"
//                                     class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
//                             </div>
//                         </div>
//                         <div>
//                             <input id="newEmail" name="newEmail" type="email" placeholder="Enter your email"
//                                 class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
//                         </div>
//                         <div>
//                             <input id="newPassword" name="newPassword" type="password" placeholder="Enter your password"
//                                 class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
//                         </div>
//                         <div>
//                             <label class="block text-sm" for="birthday">Date of Birth</label>
//                             <input id="birthday" name="birthday" type="date"
//                                 class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
//                         </div>
//                         <div>
//                             <select id="gender" name="gender"
//                                 class="w-full h-10 px-3 mt-1 placeholder-gray-400 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
//                                 <option value="male">Male</option>
//                                 <option value="female">Female</option>
//                                 <option value="other">Other</option>
//                             </select>
//                         </div>
//                         <button
//                             class="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50">Sign
//                         Up</button>
//                 </form>
//                 <a href="javascript:void(0)" onclick="toggleRegistrationForm()"
//                     class="inline-flex items-center justify-center w-full h-10 px-4 mt-2 text-sm font-medium text-purple-600 bg-transparent border border-purple-600 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50">Close</a>
//                 </div>
//             </div>
//             <script>
//                 function toggleRegistrationForm() {
//                   var registrationForm = document.getElementById("registrationForm");
//                   var overlay = document.getElementById("overlay");
//                   if (registrationForm.style.display === "none") {
//                     registrationForm.style.display = "block";
//                     overlay.style.display = "block";
//                   } else {
//                     registrationForm.style.display = "none";
//                     overlay.style.display = "none";
//                   }
//                 }
//             </script>
//         </body>
//     </html>
//     `)
// })

// app.post('/login', async (c) => {
//     const body = await c.req.parseBody();
//     const { username, password } = body;
//     const user = await loginUser(username.toString(), password.toString());
//     if (user) {
//       return c.redirect('/users/' + user.get('FirstName'));
//     } else {
//       return c.redirect('/');
//     }
//   });

// app.get('/users', async (c) => {
//     const users = await getAllUsers();
//     return c.json(users);
// });

// app.get('/users/:username', async (c) => {

//     return c.html(`<html>
//     <head>
//         <title>User Profile</title>
//     </head>
//     <body style="background-color: rgba(3, 91, 12, 1);">
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⠀⣂⣒⠚⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⢋⣡⣶⣾⣿⣿⣿⣿⣶⣶⣤⣉⠛⠿⣿⣿⡿⠛⣋⣡⣤⣶⣶⣶⣤⣉⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢁⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣌⠰⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠹⣿⣿⣿⣿⣿⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⣰⣿⣿⣿⣿⣿⣿⡿⠟⣛⣛⣛⣛⡛⠻⢿⣿⣿⣆⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⢻⣿⣿⣿⣿⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⡿⢁⣾⣿⣿⣿⣿⣿⣯⣷⣾⣿⣿⣿⣿⣿⣿⣿⣶⣤⣉⡛⠂⢙⣯⣭⣭⣽⣿⣿⣿⣿⣯⣭⣿⡀⠙⠿⢿⣿⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⡿⢡⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠟⢛⣛⣛⣛⣛⣟⣳⡄⠹⢿⣿⣿⣿⠿⠿⠿⢿⣛⣛⣻⣟⡶⠦⢀⠹⢿⣿
//     ⣿⣿⣿⣿⠿⠋⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⡉⠤⠖⠉⠉⢁⡐⣀⣈⠩⠙⠛⠲⠀⠋⣩⠴⣒⠈⠉⠉⢉⣭⣭⠉⠭⠟⠿⠦⠀⠹
//     ⣿⣿⡿⣡⣴⣿⢸⣿⣿⣿⣿⣿⣿⡿⠟⢉⠄⢐⠍⢀⣠⡴⠊⠤⠁⠀⠈⢻⣿⣷⣶⣦⣤⡄⠐⣛⣥⣴⡶⠋⠄⠀⠀⠈⠃⣾⣶⣤⣅⠀
//     ⣿⠟⣱⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠠⠔⠀⣠⣶⣿⣿⠁⠀⠄⠀⠛⠀⠀⣿⣿⣿⣿⣿⣿⠀⣿⣿⣿⠀⠀⠄⠀⠃⠀⠀⣸⣿⣿⣿⡦
//     ⡟⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⢉⠻⣿⣿⡄⠀⠀⠀⠀⠀⢰⣿⣿⣿⠿⠛⠁⠾⣿⣿⣿⣇⡀⠀⠀⠀⢀⣴⣿⠿⠟⠉⠀
//     ⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣅⡀⠉⠉⠑⠒⠒⠒⠒⢋⡉⠉⠁⣀⣠⣴⣶⣶⣦⣭⣭⣵⣶⣷⣶⣥⣶⣶⡶⠈⢁⣐
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣿⣿⣿⡷⠂⣠⣾⣿⣿⣿⣿⠻⢿⣿⣿⣿⣿⣿⣿⡿⠋⢁⣠⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⢋⣡⣴⣾⣿⣿⣿⣿⣿⣿⣷⣦⡈⢿⣶⣶⣶⣿⣦⡀⠊⢻⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡈⢿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠘⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⣠⣴⣶⣿⣿⣶⣤⣤⣤⣤⣈⣉⣉⣉⣉⣛⡛⠛⠛⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠟⢛⡀⠹⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢉⣴⣿⣿⣿⣇⣀⣤⣤⣤⣬⣭⣍⣉⡛⠛⠻⠿⣿⣿⣿⣷⣦⣤⣤⣤⣤⣭⣉⣉⣉⠉⣩⣤⣤⣾⡟⠇⢠⣿
//     ⣿⣿⣿⣿⣿⣿⡏⠹⣿⡇⠘⠛⠛⠛⠛⠛⠛⠛⠛⠛⠿⣿⣿⣿⣿⣿⣶⣶⣤⣤⣬⣭⣍⣙⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠁⣴⣿⣿
//     ⢿⣿⣿⣿⣿⣿⣿⣦⡈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣤⣍⣉⠉⠛⠻⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⢁⣼⣿⣿⣿
//     ⠀⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣤⣤⠌⠉⢉⣠⣶⣿⣿⣿⣿⣿
//     ⣤⡈⠀⠈⣛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⣠⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿
//     ⣿⣿⣷⣦⣄⡈⠓⠨⠭⠽⢿⣟⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⠛⢋⣁⣴⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣶⣶⣤⣤⣀⣉⣉⣉⣉⠛⠛⠒⠒⠲⠶⠶⠿⠿⠿⠿⠃⠐⢂⣈⣀⣤⣦⣀⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//     ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⣿⣿⣿⣿⣷⣄⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
//     </body>
// </html> `
// )});

// app.onError((error, c) => {
//     return c.html(`<html>
//     <head>
//         <title>Error</title>
//     </head>
//     <body>
//         <h1>An error occurred</h1>
//         <p>${error}</p>
//     </body>
// </html> `)});

// app.post('/register', async (c) => {
//     const body = await c.req.parseBody();

//     const { newEmail, newPassword, firstName, lastName, birthday, gender } = body;

//     console.log(newEmail, newPassword, firstName, lastName, birthday, gender);

// await registerUser(
//     newEmail.toString(),
//     newPassword.toString(),
//     firstName.toString(),
//     lastName.toString(),
//     birthday.toString() as unknown as Date,
//     gender.toString()
// );

//     return c.text('User registered successfully?');
// });

// export default app
