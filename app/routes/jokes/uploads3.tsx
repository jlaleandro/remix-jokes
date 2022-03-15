import { unstable_createFileUploadHandler, unstable_parseMultipartFormData, useCatch } from "remix";
import { ActionFunction, Form, Link, redirect } from "remix";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";

import * as path from "path";
import * as fs from "fs";

const client = new S3Client({ region: "sa-east-1" });

export const action: ActionFunction = async ({
  request,
}) => {

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  //uploadHandler retorna informações do arquivo
  //upload no servidor
  const avatarUrl = formData.get("avatar");
  let arquivo: any =
  {
    filepath: String,
    type: String,
    name: String,
  };
  arquivo = avatarUrl;

  //upload aws s3
  const fileStream = fs.createReadStream(arquivo.filepath);
  const uploadParams = {
    Bucket: "tinuvens-enfs",
    acl: "public-read",
    ContentType: arquivo.type,
    Key: "upload_pdf/" + arquivo.name,
    Body: fileStream,
  };

  const data = await client.send(new PutObjectCommand(uploadParams));
  console.log("Success", data);

  // update the currently logged in user's avatar in our database

  return redirect(".");
};


const uploadHandler = unstable_createFileUploadHandler({
  maxFileSize: 5_000_000,
  directory: path.resolve(__dirname, '..', 'tmp', 'uploads'),
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



