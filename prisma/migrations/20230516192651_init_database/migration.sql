-- CreateEnum
CREATE TYPE "Identity" AS ENUM ('GAME_PROVIDER', 'REGULAR_USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'DELETED');

-- CreateEnum
CREATE TYPE "VideoSlicingStatus" AS ENUM ('SUBMITTED', 'PROGRESSING', 'CANCELED', 'ERROR', 'COMPLETE');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "GameCategory" AS ENUM ('ARCADE', 'BATTLE_ROYAL', 'CARD', 'CASUAL', 'FIGHTING', 'FPS', 'MMORPG', 'MOBA', 'PUZZLE', 'RACING', 'RPG', 'RTS', 'SANDBOX', 'SLG', 'SPORTS', 'TOWER_DEFENCE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "tag" "Identity" NOT NULL DEFAULT 'REGULAR_USER',
    "avatarIcon" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "gameMention" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imagePath" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleImage" (
    "postId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VideoPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" CHAR(200) NOT NULL,
    "description" CHAR(1000) NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "gameMention" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoOriginalPath" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VideoPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoInformation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "res360p" TEXT NOT NULL,
    "res480p" TEXT NOT NULL,
    "res720p" TEXT NOT NULL,
    "res1080p" TEXT NOT NULL,
    "videoOriginalPath" TEXT NOT NULL,
    "mediaConverterJobId" TEXT NOT NULL,
    "mediaConverterStatus" "VideoSlicingStatus" NOT NULL,

    CONSTRAINT "VideoInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "articleId" TEXT,
    "videoPostId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentCommentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameInformation" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameCategory" "GameCategory"[],
    "introduction" TEXT NOT NULL,
    "gameIconImagePath" TEXT NOT NULL,
    "chain" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "videoPath" TEXT,
    "chainMetaData" JSONB,
    "externalLink" JSONB,
    "chainModifiedGame" JSONB,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GameInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowingTable" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followingId" TEXT[],
    "followerId" TEXT[],

    CONSTRAINT "FollowingTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_key" ON "UserSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleImage_postId_imagePath_key" ON "ArticleImage"("postId", "imagePath");

-- CreateIndex
CREATE UNIQUE INDEX "VideoInformation_videoOriginalPath_key" ON "VideoInformation"("videoOriginalPath");

-- CreateIndex
CREATE UNIQUE INDEX "VideoInformation_mediaConverterJobId_key" ON "VideoInformation"("mediaConverterJobId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowingTable_userId_key" ON "FollowingTable"("userId");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPost" ADD CONSTRAINT "VideoPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoInformation" ADD CONSTRAINT "VideoInformation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "VideoPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_videoPostId_fkey" FOREIGN KEY ("videoPostId") REFERENCES "VideoPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubComment" ADD CONSTRAINT "SubComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowingTable" ADD CONSTRAINT "FollowingTable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
