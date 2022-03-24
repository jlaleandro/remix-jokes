import { LoaderFunction, unstable_createFileUploadHandler, unstable_parseMultipartFormData, useCatch } from "remix";
import { ActionFunction, Form, Link, redirect, json } from "remix";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";

import * as path from "path";
import * as fs from "fs";
import { getUserId } from "~/utils/session.server";


export const loader: LoaderFunction = async ({
  request,
}) => {

  const userId = await getUserId(request);
  if (!userId) {
    //return redirect("/login");
    throw new Response("Unauthorized", { status: 401 });
  }
  return {};
};

const client = new S3Client({ region: "sa-east-1" });

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

const badRequest = (data: ActionData) =>
  json(data, { status: 400 });

export const action: ActionFunction = async ({
  request,
}) => {


  try {
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


    const fileStream = fs.createReadStream(arquivo.filepath);
    const uploadParams = {
      Bucket: "tinuvens-enfs",
      acl: "public-read",
      ContentType: arquivo.type,
      Key: "upload_pdf/" + arquivo.name,
      Body: fileStream,
    };



    //upload aws s3
    try {
      const data = await client.send(new PutObjectCommand(uploadParams));
      console.log("Success", data);

    } catch (error) {
      console.log('aaaaaaaaa')
      // return badRequest({
      //   formError: `Form not submitted correctly.`,
      // });
      throw new Response("Unauthorized", { status: 401 });
    }

    // update the currently logged in user's avatar in our database

    //excluir arquivo do servidor
    fs.unlink(arquivo.filepath, function (err) {
      if (err) {
        return badRequest({
          formError: `Form not submitted correctly.`,
        });
      }
    });

  } catch (error) {
    console.log('bbbbbbbbbbbbb')
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
    //throw new Response("Unauthorized", { status: 401 });
  }

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

  console.log('alollll..............')


  switch (caught.status) {
    case 401: {
      return (
        <div className="error-container">
          <p>Usuário não logado.</p>
          <Link to="/login">Login</Link>
        </div>
      );
    }
    case 404: {
      return (
        <div className="error-container">
          <p>Usuário não logado.</p>
          <Link to="/login">Login</Link>
        </div>
      );
    } default: {
      return (
        <div className="error-container">
          <p>Erro no envio p aws.</p>
        </div>
      );
    }
  }
}



export function ErrorBoundary({ error }: { error: Error }) {
  console.log('aq..............ErrorBoundary')
  return (
    <div className="error-container">
      <h1>App Error</h1>
      <pre>{error.message}</pre>
    </div>
  );
}

