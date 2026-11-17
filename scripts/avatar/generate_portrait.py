"""Generates a fictional, photoreal presenter portrait locally (Stable Diffusion XL).

The face is AI-generated (not a real person). Front-facing with a closed-mouth
smile, which is what the lip-sync step works best with.

  .venv-ai/bin/python scripts/avatar/generate_portrait.py --out assets/images/avatar --count 4
"""

import argparse
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HOME", str(ROOT / ".cache/huggingface"))

import torch  # noqa: E402
from diffusers import DPMSolverMultistepScheduler, StableDiffusionXLPipeline  # noqa: E402

MODEL = "SG161222/RealVisXL_V5.0_Lightning"
PROMPT = (
    "professional studio headshot photo of a friendly young American woman, tech product presenter, "
    "looking directly at the camera, head and shoulders, gentle closed-mouth smile, "
    "wearing a dark green blazer over a white top, soft even studio lighting, clean soft light-mint background, "
    "natural skin texture, 85mm lens, sharp focus, photorealistic"
)
NEGATIVE = (
    "cartoon, illustration, 3d render, painting, deformed, asymmetrical face, open mouth, teeth, "
    "glasses, hands, hat, text, watermark, logo, blurry, low quality, head tilt, profile view"
)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True)
    p.add_argument("--count", type=int, default=4)
    p.add_argument("--seed", type=int, default=7)
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
    for i in range(args.count):
        seed = args.seed + i
        g = torch.Generator("cpu").manual_seed(seed)
        image = pipe(
            prompt=PROMPT, negative_prompt=NEGATIVE, num_inference_steps=6, guidance_scale=1.8,
            width=1024, height=1024, generator=g,
        ).images[0]
        path = out / f"presenter-{seed}.png"
        image.save(path)
        print(f"[portrait] {path}", flush=True)


if __name__ == "__main__":
    main()
