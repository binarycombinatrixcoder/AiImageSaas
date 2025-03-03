'use client'

import { dataUrl, debounce, download, getImageSize } from '@/lib/utils'
import { CldImage, getCldImageUrl } from 'next-cloudinary'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import React, { useState, useCallback } from 'react'
import ImageEditor from './ImageEditor' // Import ImageEditor

interface TransformedImageProps {
  image: any
  type: string
  title: string
  transformationConfig: any
  isTransforming: boolean
  setIsTransforming?: (isTransforming: boolean) => void
  imageId: string // Add imageId prop
  onImageUpdated: (updatedImage: any) => void // Callback for image update in parent
  imageUrl: string // Add imageUrl prop
  open: boolean
  close: () => void
}

const TransformedImage = ({
  image,
  type,
  title,
  transformationConfig,
  isTransforming,
  setIsTransforming,
  imageId,
  onImageUpdated,
  imageUrl,
  open,
  close
}: TransformedImageProps) => {
  // const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   e.preventDefault();

  //   download(getCldImageUrl({
  //     width: image?.width,
  //     height: image?.height,
  //     src: image?.publicId,
  //     ...transformationConfig
  //   }), title)
  // }

  // const [isOpen, setIsOpen] = useState(false)

  // const closeImgEditor = useCallback(() => {
  //   setIsOpen(false)
  // }, [setIsOpen])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-between">
        <h3 className="h3-bold text-dark-600">Transformed</h3>

        {/* Replace download button with Edit Image button */}
        {/* <button className="download-btn" onClick={() => setIsOpen(true)}>
          <Image
            src="/assets/icons/download.svg" // You can use an edit icon
            alt="Edit"
            width={24}
            height={24}
            className="pb-[6px]"
          />
        </button> */}
      </div>

      {image?.publicId && transformationConfig ? (
        <div className="relative">
          <CldImage
            width={getImageSize(type, image, 'width')}
            height={getImageSize(type, image, 'height')}
            src={image?.publicId}
            alt={image.title}
            sizes={'(max-width: 767px) 100vw, 50vw'}
            placeholder={dataUrl as PlaceholderValue}
            className="transformed-image"
            onLoad={() => {
              setIsTransforming && setIsTransforming(false)
            }}
            onError={() => {
              debounce(() => {
                setIsTransforming && setIsTransforming(false)
              }, 8000)()
            }}
            {...transformationConfig}
          />

          {isTransforming && (
            <div className="transforming-loader">
              <Image src="/assets/icons/spinner.svg" width={50} height={50} alt="spinner" />
              <p className="text-white/80">Please wait...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="transformed-placeholder">Transformed Image</div>
      )}

      {/* ImageEditor component, conditionally rendered */}
      {open && (
        <div className="fixed top-0 left-0 h-screen w-screen flex justify-center items-center bg-black/50 z-50">
          {' '}
          {/* Centered overlay */}
          <div className="relative max-h-screen max-w-screen">
            <ImageEditor
              imageUrl={getCldImageUrl({
                // Use getCldImageUrl to get the transformed image URL for editor
                width: image?.width,
                height: image?.height,
                src: image?.publicId,
                ...transformationConfig
              })}
              imageId={imageId}
              onImageUpdated={onImageUpdated}
              onClose={close}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TransformedImage
