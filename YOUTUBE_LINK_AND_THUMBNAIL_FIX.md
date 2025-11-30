# Fix: YouTube Link Visibility & Default Thumbnail

## Issues
1. **YouTube Link Visibility**: Users couldn't see the YouTube URL in the lesson list after adding a video lesson.
2. **Default Thumbnail**: Users wanted the course thumbnail to automatically default to the YouTube video thumbnail if no custom image was uploaded.
3. **Publish Button Disabled**: The publish button remained disabled because users couldn't successfully add lessons (due to the previous auth error), failing the "At least one lesson" requirement.

## Solution

### 1. Updated `LessonManager.tsx`
- **Added URL Display**: Modified the lesson list item to display the YouTube URL as a clickable link below the lesson title.
- **Auto-Thumbnail Logic**: In `handleAddLesson`, added logic to check if `courseData.thumbnailUrl` is empty. If so, and a video lesson is being added, it automatically sets the course thumbnail to the YouTube video's high-res thumbnail (`maxresdefault.jpg`).

```typescript
// Auto-set course thumbnail if missing
if (lessonType === 'VIDEO' && youtubeMetadata?.videoId && !courseData.thumbnailUrl) {
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeMetadata.videoId}/maxresdefault.jpg`;
  setCourseData({ thumbnailUrl });
}
```

## Verification
1. **Add Video Lesson**: Add a video lesson with a valid YouTube URL.
2. **Check List**: The YouTube URL should now be visible in the lesson list.
3. **Check Thumbnail**: If you hadn't uploaded a course thumbnail, the "Basic Info" tab should now show the video's thumbnail.
4. **Publish**: With a lesson added, the "Publish Course" button should now be enabled (assuming title/description/category are also filled).
