import asyncio
import dspy
from enum import Enum
from pydantic import BaseModel, Field
from typing import List

# ------------------------------
# Define Pydantic Models
# ------------------------------

class SocialPlatform(str, Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"

class Input(BaseModel):
    content: str = Field(..., description="The content for which to generate hashtags")
    platform: str = Field(..., description="Social media platform (facebook, instagram, twitter, linkedin)")
    industry: str = Field(..., description="Industry or niche of the content")
    count: int = Field(default=15, description="Number of hashtags to generate")

class HashtagRecommendation(BaseModel):
    tag: str = Field(..., description="Hashtag text")
    relevance_score: float = Field(..., description="Relevance to content [0-1]")
    recent_popularity: float = Field(..., description="Recent usage popularity [0-1]")

class Output(BaseModel):
    hashtags: List[str] = Field(..., description="List of generated hashtags")

# ------------------------------
# Define DSPy Signature
# ------------------------------

class HashtagGeneratorSignature(dspy.Signature):
    """Generate relevant hashtags for social media content"""
    input: Input = dspy.InputField()
    output: Output = dspy.OutputField()

# ------------------------------
# Hashtag Generator Class
# ------------------------------

class HashtagGenerator(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate = dspy.Predict(HashtagGeneratorSignature)

    def forward(self, content: str, platform: SocialPlatform, industry: str, count: int = 15) -> List[str]:
        result = self.generate(
            input=Input(
                content=content,
                platform=platform.value,
                industry=industry,
                count=count
            )
        )
        return result.output.hashtags

class TyakkaiHashtagAPI:
    def __init__(
        self,
        api_key: str,
        api_base: str = None,
        model_name: str = "openai/gpt-4"
    ):
        self.api_key = api_key
        self.api_base = api_base
        self.model_name = model_name
        
        # Configure DSPy
        dspy.configure(
            lm=dspy.LM(
                model=self.model_name,
                api_key=self.api_key,
                api_base=self.api_base
            )
        )
        self.generator = HashtagGenerator()

    async def generate_hashtags(self, content: str, platform: str, industry: str, count: int = 15) -> List[str]:
        try:
            platform_enum = SocialPlatform[platform.upper()]
            return await asyncio.to_thread(
                self.generator.forward,
                content=content,
                platform=platform_enum,
                industry=industry,
                count=count
            )
        except KeyError:
            raise ValueError(f"Invalid platform. Must be one of: {[p.value for p in SocialPlatform]}")

# ------------------------------
# Main Execution
# ------------------------------

async def main():
    # Initialize with your actual API key
    GROK_API_KEY = "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"
    
    hashtag_api = TyakkaiHashtagAPI(
        model_name="llama3-70b-8192",
        api_key=GROK_API_KEY,
        api_base="https://api.groq.com/openai/v1"
    )

    hashtags = await hashtag_api.generate_hashtags(
        content="new summer t-shirt for men!",
        platform="twitter",
        industry="garment",
        count=15
    )

    print("Generated Hashtags:")
    print(hashtags)

if __name__ == "__main__":
    asyncio.run(main())