import { unstable_createFileUploadHandler, unstable_parseMultipartFormData, useCatch } from "remix";
import { ActionFunction, Form, Link, redirect } from "remix";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import * as path from "path";
import * as fs from "fs";

const client = new S3Client({ region: "sa-east-1" });


//console.log(' linha 11 client' + client.config)

const file = "./tmp/uploads/vivo.pdf"; // Path to and name of object. For example '../myFiles/index.js'.
//console.log(file)

const fileStream = fs.createReadStream(file);

//console.log(fileStream)
console.log("alollll " + path.basename(file));

const uploadParams = {
  Bucket: "tinuvens-enfs",

  acl: "public-read",

  ContentType: 'application/pdf',

  // Add the required 'Key' parameter using the 'path' module.
  Key: "upload_pdf/" + path.basename(file),
  //   // Add the required 'Body' parameter
  Body: fileStream,
};
console.log(uploadParams)

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
  //console.log(`Avatar aqui.... `)
  //console.log(avatarUrl)

  const data = await client.send(new PutObjectCommand(uploadParams));
  console.log("Success", data);

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



