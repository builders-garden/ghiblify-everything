import { type NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { z } from "zod";

import { ReplicateResponse } from "@/types/replicate-response";

const inputReplicateSchema = z.object({
  user_pfp: z.string(),
  user_username: z.string(),
  user_fid: z.string(),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReplicateResponse>> {
  try {
    const data = await request.json();
    const { success, data: parsedData } = inputReplicateSchema.safeParse(data);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Invalid replicate arguments" },
        { status: 400 }
      );
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = (await replicate.run(
      "karanchawla/studio-ghibli:fd1975a55465d2cf70e5e9aad03e0bb2b13b9f9b715d49a27748fc45797a6ae5",
      {
        input: {
          width: 512,
          height: 512,
          prompt:
            "Transform this image into a Studio Ghibli-inspired anime-style illustration, with Ghibli style. Maintain the core elements of the original scene, but reimagine it with the signature Ghibli aesthetic—soft, hand-painted textures, warm and vibrant colors, and a whimsical, dreamlike atmosphere.",
          refine: "no_refiner",
          scheduler: "DDIM",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: true,
          high_noise_frac: 0.8,
          prompt_strength: 0.7,
          num_inference_steps: 50,
          disable_safety_checker: true,
          init_image: parsedData.user_pfp,
        },
      }
    )) as ReadableStream[] | { error: string };

    if (!Array.isArray(output)) {
      return NextResponse.json(
        { success: false, error: output.error || "Failed to generate image" },
        { status: 500 }
      );
    }

    const reader = output[0].getReader();
    const chunks = [];
    let done = false;
    while (!done) {
      const { done: doneReading, value } = await reader.read();
      if (doneReading) {
        done = true;
        break;
      }
      chunks.push(value);
    }
    const blob = new Blob(chunks);
    const url = URL.createObjectURL(blob);
    const imageUrl = url;

    return NextResponse.json(
      { success: true, output: imageUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
