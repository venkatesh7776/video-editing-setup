"""Generates fictional, photoreal imagery for the Screening video locally (SDXL, RealVisXL V5 Lightning).

People are AI-generated (not real persons). Scene 1: recruiter on the right, open
space on the left for kinetic type. Scene 8: cinematic workplace background.

  .venv-ai/bin/python projects/vibelevel-screening/generate_images.py --out assets/images/vibelevel-screening/generated
"""

import argparse
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HOME", str(ROOT / ".cache/huggingface"))

import torch  # noqa: E402
from diffusers import DPMSolverMultistepScheduler, StableDiffusionXLPipeline  # noqa: E402

MODEL = "SG161222/RealVisXL_V5.0_Lightning"
COMMON_NEG = (
    "cartoon, illustration, 3d render, painting, deformed, extra fingers, bad hands, asymmetrical eyes, "
    "text, watermark, logo, signage text, blurry subject, low quality, saree, kurta, bindi, turban"
)
JOBS = {
    "s1-recruiter-woman": (
        "cinematic street portrait photo of a confident American woman recruiter in her mid thirties, "
        "standing on the right side of the frame, chest-up, looking directly into the camera with a subtle knowing smile, "
        "tailored charcoal blazer over a black top, shoulder-length dark hair, "
        "busy Manhattan street behind her with crosswalk and cabs, heavy bokeh, shallow depth of field, "
        "overcast soft light, empty out-of-focus space on the left half, 50mm lens, photorealistic, natural skin texture",
        COMMON_NEG + ", centered subject, looking away, open mouth"),
    "s1-recruiter-man": (
        "cinematic street portrait photo of a confident American man recruiter in his late thirties, "
        "standing on the right side of the frame, chest-up, looking directly into the camera, calm confident expression, "
        "navy suit jacket, white open-collar shirt, short neat hair, light stubble, "
        "busy Manhattan street behind him with crosswalk and cabs, heavy bokeh, shallow depth of field, "
        "overcast soft light, empty out-of-focus space on the left half, 50mm lens, photorealistic, natural skin texture",
        COMMON_NEG + ", centered subject, looking away, open mouth, tie"),
    # Composition first and under CLIP's 77-token limit, so "subject on the right" survives.
    "s1-recruiter-right": (
        "wide cinematic photo, woman standing at far right edge of frame, large empty blurred city street on left, "
        "confident American female recruiter, 35, charcoal blazer, looking into camera, Manhattan crosswalk bokeh, "
        "overcast light, photorealistic",
        COMMON_NEG + ", centered subject, looking away, open mouth"),
    "s8-background": (
        "cinematic wide photo of a modern bright open-plan tech office in San Francisco at golden hour, "
        "a small diverse American hiring team in smart casual clothes collaborating around a large monitor, seen from behind, "
        "floor-to-ceiling windows, city skyline, plants, warm light, very shallow depth of field, heavily out of focus, "
        "moody, premium, 35mm lens, photorealistic",
        COMMON_NEG + ", handshake, faces in focus, readable screen"),
}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True)
    p.add_argument("--count", type=int, default=3)
    p.add_argument("--seed", type=int, default=21)
    p.add_argument("--only")
    args = p.parse_args()

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    try:
        pipe = StableDiffusionXLPipeline.from_pretrained(MODEL, torch_dtype=torch.float16, variant="fp16")
    except Exception:
        pipe = StableDiffusionXLPipeline.from_pretrained(MODEL, torch_dtype=torch.float16)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config, use_karras_sigmas=True, algorithm_type="sde-dpmsolver++"
    )
    pipe.to(device)
    pipe.vae.to(torch.float32)  # avoids black images from fp16 VAE overflow on MPS
    pipe.vae.config.force_upcast = True

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for name, (prompt, negative) in JOBS.items():
        if args.only and name not in args.only.split(","):
            continue
        for i in range(args.count):
            seed = args.seed + i
            g = torch.Generator("cpu").manual_seed(seed)
            image = pipe(
                prompt=prompt, negative_prompt=negative, num_inference_steps=6, guidance_scale=1.8,
                width=1344, height=768, generator=g,
            ).images[0]
            path = out / f"{name}-{seed}.png"
            image.save(path)
            print(f"[image] {path}", flush=True)


if __name__ == "__main__":
    main()
