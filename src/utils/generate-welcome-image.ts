import { createCanvas, loadImage } from "canvas";
import { Buffer } from "buffer";

interface WelcomeCardOptions {
  discordUsername: string;
  osuUsername: string;
  discordAvatarUrl: string;
  osuAvatarUrl: string;
  serverName?: string; // Optional server name
  backgroundColor?: {
    start: string;
    middle: string;
    end: string;
  };
}

export async function generateWelcomeCard(
  options: WelcomeCardOptions
): Promise<Buffer> {
  const {
    discordUsername,
    osuUsername,
    discordAvatarUrl = "https://i.redd.it/ia970w1gp9wc1.png",
    osuAvatarUrl,
    serverName,
    backgroundColor = {
      start: "#5865f2",
      middle: "#7289da",
      end: "#99aab5",
    },
  } = options;

  // Card dimensions
  const width = 600;
  const height = 300;

  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Helper function to draw rounded rectangle
  function drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Helper function to draw pattern
  function drawPattern() {
    const patternSize = 60;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";

    for (let x = 0; x < width; x += patternSize) {
      for (let y = 0; y < height; y += patternSize) {
        // Draw small crosses
        ctx.fillRect(x + 26, y + 24, 8, 2);
        ctx.fillRect(x + 28, y + 22, 2, 8);
        ctx.fillRect(x + 26, y + 44, 8, 2);
        ctx.fillRect(x + 28, y + 42, 2, 8);
        ctx.fillRect(x + 6, y + 24, 8, 2);
        ctx.fillRect(x + 8, y + 22, 2, 8);
        ctx.fillRect(x + 6, y + 44, 8, 2);
        ctx.fillRect(x + 8, y + 42, 2, 8);
      }
    }
  }

  // Helper function to draw circular image
  async function drawCircularImage(
    imageUrl: string,
    x: number,
    y: number,
    radius: number
  ) {
    try {
      const image = await loadImage(imageUrl);

      // Save context
      ctx.save();

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw image
      ctx.drawImage(image, x, y, radius * 2, radius * 2);

      // Restore context
      ctx.restore();

      // Draw border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
      ctx.stroke();
    } catch (error) {
      console.error(`Failed to load image: ${imageUrl}`, error);
      // Draw placeholder circle
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw placeholder text
      ctx.fillStyle = "white";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("?", x + radius, y + radius + 8);
    }
  }

  // Helper function to draw text with shadow
  function drawTextWithShadow(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    fontWeight: string = "normal",
    color: string = "white",
    shadowColor: string = "rgba(0,0,0,0.4)"
  ) {
    ctx.font = `${fontWeight} ${fontSize}px Arial`;
    ctx.textAlign = "center";

    // Draw shadow
    ctx.fillStyle = shadowColor;
    ctx.fillText(text, x + 2, y + 2);

    // Draw main text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  // Helper function to truncate text if too long
  function truncateText(
    text: string,
    maxWidth: number,
    fontSize: number
  ): string {
    ctx.font = `bold ${fontSize}px Arial`;
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }

    let truncated = text;
    while (
      ctx.measureText(truncated + "...").width > maxWidth &&
      truncated.length > 1
    ) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + "...";
  }

  // Draw background with gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, backgroundColor.start);
  gradient.addColorStop(0.5, backgroundColor.middle);
  gradient.addColorStop(1, backgroundColor.end);

  drawRoundedRect(0, 0, width, height, 20);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw pattern overlay
  drawPattern();

  // Draw border
  ctx.strokeStyle = backgroundColor.start;
  ctx.lineWidth = 2;
  drawRoundedRect(0, 0, width, height, 20);
  ctx.stroke();

  // Profile picture settings
  const profileRadius = 50; // Increased from 40
  const leftProfileX = 40;
  const rightProfileX = width - 140; // Adjusted for larger profile
  const profileY = height / 2 - profileRadius;

  // Draw profile pictures
  await drawCircularImage(
    discordAvatarUrl,
    leftProfileX,
    profileY,
    profileRadius
  );
  await drawCircularImage(osuAvatarUrl, rightProfileX, profileY, profileRadius);

  // Draw usernames and platform labels
  const usernameY = height / 2 + profileRadius + 30; // Adjusted for larger profile
  const platformY = usernameY + 20;

  // Discord username
  const truncatedDiscordUsername = truncateText(discordUsername, 140, 16); // Increased width
  drawTextWithShadow(
    truncatedDiscordUsername,
    leftProfileX + profileRadius,
    usernameY,
    16,
    "bold"
  );
  drawTextWithShadow(
    "Discord",
    leftProfileX + profileRadius,
    platformY,
    12,
    "normal",
    "rgba(255,255,255,0.8)"
  );

  // osu! username
  const truncatedOsuUsername = truncateText(osuUsername, 140, 16); // Increased width
  drawTextWithShadow(
    truncatedOsuUsername,
    rightProfileX + profileRadius,
    usernameY,
    16,
    "bold"
  );
  drawTextWithShadow(
    "osu!",
    rightProfileX + profileRadius,
    platformY,
    12,
    "normal",
    "rgba(255,255,255,0.8)"
  );

  // Draw center content
  const centerX = width / 2;
  const centerY = height / 2;

  // Success icon (sparkle emoji as text)
  drawTextWithShadow("✨", centerX, centerY - 40, 48);

  // Main welcome text
  drawTextWithShadow("Profiles Linked!", centerX, centerY, 24, "bold");

  // Subtitle
  const subtitle = serverName ? `Welcome to ${serverName}` : "Welcome aboard";
  drawTextWithShadow(
    subtitle,
    centerX,
    centerY + 25,
    16,
    "normal",
    "rgba(255,255,255,0.9)"
  );

  // Draw linking lines
  const lineY = centerY + 50;
  const lineWidth = 60;
  const lineHeight = 3;

  // Left line
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillRect(centerX - lineWidth - 15, lineY, lineWidth, lineHeight);

  // Right line
  ctx.fillRect(centerX + 15, lineY, lineWidth, lineHeight);

  // Center link icon
  drawTextWithShadow("✨", centerX, lineY + 8, 16);

  // Return the canvas as a buffer
  return canvas.toBuffer("image/png");
}

// Example usage function
export async function createWelcomeImage(
  discordUsername: string,
  osuUsername: string,
  discordAvatarUrl: string,
  osuAvatarUrl: string,
  serverName?: string,
  customColors?: {
    start: string;
    middle: string;
    end: string;
  }
): Promise<Buffer> {
  return await generateWelcomeCard({
    discordUsername,
    osuUsername,
    discordAvatarUrl,
    osuAvatarUrl,
    serverName,
    backgroundColor: customColors,
  });
}

// Usage examples:
/*
// Basic usage with default colors
const imageBuffer = await createWelcomeImage(
  'JohnDoe#1234',
  'cookiezi',
  'https://cdn.discordapp.com/avatars/123456789/avatar.png',
  'https://a.ppy.sh/124493'
);

// With custom server name
const imageBuffer2 = await createWelcomeImage(
  'JohnDoe#1234',
  'cookiezi',
  'https://cdn.discordapp.com/avatars/123456789/avatar.png',
  'https://a.ppy.sh/124493',
  'My Awesome Server'
);

// With custom colors (osu! pink theme)
const imageBuffer3 = await createWelcomeImage(
  'JohnDoe#1234',
  'cookiezi',
  'https://cdn.discordapp.com/avatars/123456789/avatar.png',
  'https://a.ppy.sh/124493',
  'osu! Community',
  {
    start: '#ff1744',
    middle: '#ff6b9d',
    end: '#ff9a9e'
  }
);

// Send to Discord
const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });
await channel.send({ files: [attachment] });
*/
