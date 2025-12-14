// 全局视频文件存储
// 用于在页面之间共享视频文件，因为 blob URL 在页面跳转后会失效

interface StoredVideo {
  file: File
  url: string
  name: string
  size: number
  type: string
}

class VideoStore {
  private video: StoredVideo | null = null

  setVideo(file: File): string {
    // 清理之前的 URL
    if (this.video?.url) {
      URL.revokeObjectURL(this.video.url)
    }

    const url = URL.createObjectURL(file)
    this.video = {
      file,
      url,
      name: file.name,
      size: file.size,
      type: file.type,
    }
    return url
  }

  getVideo(): StoredVideo | null {
    return this.video
  }

  getUrl(): string | null {
    return this.video?.url || null
  }

  clear(): void {
    if (this.video?.url) {
      URL.revokeObjectURL(this.video.url)
    }
    this.video = null
  }
}

// 单例实例
export const videoStore = new VideoStore()
