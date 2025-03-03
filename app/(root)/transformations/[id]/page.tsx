import { auth } from '@clerk/nextjs'
import { getImageById } from '@/lib/actions/image.actions'
import ImageDetailsClient from '@/components/shared/ImageDetailsClient' // Import the client component

interface SearchParamProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

const ImageDetails = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = auth()

  const initialImage = await getImageById(id) // Fetch image data server-side

  if (!initialImage) {
    return <div>Image not found</div> // Handle case where image is not found
  }

  if (!initialImage.author) {
    return <div>Author information not found</div> // Handle case where author is not found
  }

  return <ImageDetailsClient initialImage={initialImage} /> // Render the client component and pass initialImage as prop
}

export default ImageDetails
