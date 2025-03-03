'use client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useState, useCallback } from 'react' // Import useState here
import Header from '@/components/shared/Header'
import TransformedImage from '@/components/shared/TransformedImage'
import { Button } from '@/components/ui/button'
import { getImageSize } from '@/lib/utils'
import { DeleteConfirmation } from '@/components/shared/DeleteConfirmation'
// import ImageEditor from '@/components/shared/ImageEditor' // No need to import ImageEditor here anymore

interface ImageDetailsClientProps {
  initialImage: any // Define the type for initialImage, use 'any' if unsure, or create a more specific type
}

const ImageDetailsClient: React.FC<ImageDetailsClientProps> = ({ initialImage }) => {
  const [image, setImage] = useState(initialImage) // Use useState in client component
  const [isOpen, setIsOpen] = useState(false)

  const closeImgEditor = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const onImageUpdatedHandler = (updatedImage: any) => {
    // Handler to update image state
    setImage(updatedImage)
  }

  if (!image) {
    return <div>Loading image details...</div> // Or handle loading state appropriately
  }

  const { userId } = React.useMemo(() => {
    // Use useMemo to avoid re-rendering on every change
    return { userId: image.author?.clerkId || null }
  }, [image.author?.clerkId])
  console.log('image obj', image)
  return (
    <>
      <Header title={image.title} />

      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-dark-600">Transformation:</p>
          <p className=" capitalize text-purple-400">{image.transformationType}</p>
        </div>

        {image.prompt && (
          <>
            <p className="hidden text-dark-400/50 md:block">●</p>
            <div className="p-14-medium md:p-16-medium flex gap-2 ">
              <p className="text-dark-600">Prompt:</p>
              <p className=" capitalize text-purple-400">{image.prompt}</p>
            </div>
          </>
        )}

        {image.color && (
          <>
            <p className="hidden text-dark-400/50 md:block">●</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Color:</p>
              <p className=" capitalize text-purple-400">{image.color}</p>
            </div>
          </>
        )}

        {image.aspectRatio && (
          <>
            <p className="hidden text-dark-400/50 md:block">●</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Aspect Ratio:</p>
              <p className=" capitalize text-purple-400">{image.aspectRatio}</p>
            </div>
          </>
        )}
      </section>

      <section className="mt-10 border-t border-dark-400/15">
        <div className="flex justify-center">
          <button
            className="w-full download-btn bg-purple-500 text-white rounded-md p-2 flex items-center justify-center gap-2"
            onClick={() => setIsOpen(true)}>
            <h2>Download</h2>
            <Image
              src="/assets/icons/download.svg" // You can use an edit icon
              alt="Edit"
              width={24}
              height={24}
              className="pb-[6px]"
            />
          </button>
        </div>
        <div className="transformation-grid">
          {/* MEDIA UPLOADER */}
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>

            <Image
              width={getImageSize(image.transformationType, image, 'width')}
              height={getImageSize(image.transformationType, image, 'height')}
              src={image.secureURL}
              alt="image"
              className="transformation-original_image"
            />
          </div>

          {/* TRANSFORMED IMAGE */}
          <TransformedImage
            image={image}
            type={image.transformationType}
            title={image.title}
            isTransforming={false}
            transformationConfig={image.config}
            imageId={image._id} // Pass imageId
            onImageUpdated={onImageUpdatedHandler} // Pass onImageUpdated
            imageUrl={image.transformedUrl || image.secureURL} // Pass imageUrl
            open={isOpen}
            close={closeImgEditor}
          />
        </div>

        {userId === image.author?.clerkId && (
          <div className="mt-4 space-y-4">
            <Button asChild type="button" className="submit-button capitalize">
              <Link href={`/transformations/${image._id}/update`}>Update Image</Link>
            </Button>

            <DeleteConfirmation imageId={image._id} />
            {/* ImageEditor component is now inside TransformedImage */}
            {/* <ImageEditor
              imageId={image._id}
              imageUrl={image.transformedUrl || image.secureURL}
              onImageUpdated={onImageUpdatedHandler}
            /> */}
          </div>
        )}
      </section>
    </>
  )
}

export default ImageDetailsClient
