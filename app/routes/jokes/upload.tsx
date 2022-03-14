import { ActionFunction, Form, Link, redirect, unstable_createFileUploadHandler, unstable_parseMultipartFormData, useCatch } from "remix";


export const action: ActionFunction = async ({
  request,
}) => {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler // <-- we'll look at this deeper next
  );

  // the returned value for the file field is whatever our uploadHandler returns.
  // Let's imagine we're uploading the avatar to s3,
  // so our uploadHandler returns the URL.
  const avatarUrl = formData.get("avatar");
  console.log(avatarUrl)
  // update the currently logged in user's avatar in our database
  //await updateUserAvatar(request, avatarUrl);

  // success! Redirect to account page
  return redirect(".");
};

const uploadHandler = unstable_createFileUploadHandler({
  maxFileSize: 5_000_000,
  directory: "./tmp/uploads",
  file: ({ filename }) => filename,
});

export default function AvatarUploadRoute() {
  return (
    <Form method="post" encType="multipart/form-data">
      <label htmlFor="avatar-input">Avatar</label>
      <input id="avatar-input" type="file" name="avatar" />
      <button>Upload</button>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (

      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>


    );
  }
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>

  );
}



