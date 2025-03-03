'use client'

import React, { useState, useCallback } from 'react'
import FilerobotImageEditor, { TABS, TOOLS } from 'react-filerobot-image-editor'
// import 'react-filerobot-image-editor/dist/index.css'
import { Button } from '../ui/button'

interface ImageEditorProps {
  imageUrl: string
  imageId: string // Add imageId prop
  onImageUpdated: (updatedImage: any) => void // Callback for image update in parent
  onClose: (closeReason: string, haveNotSavedChanges: boolean) => void
}

const ImageEditor = ({ imageUrl, imageId, onImageUpdated, onClose }: ImageEditorProps) => {
  // Receive imageId and onImageUpdated
  const [isOpen, setIsOpen] = useState(true)

  const closeImgEditor = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  // const handleSave = useCallback(
  //   async (editedImageObject: any) => {
  //     console.log('Saving edited image...', editedImageObject)

  //     const formData = new FormData()
  //     formData.append('image', editedImageObject.blob, 'edited_image.png')
  //     formData.append('imageId', imageId) // Use imageId prop

  //     try {
  //       const response = await fetch('/api/upload-edited-image', {
  //         // Replace with your API endpoint
  //         method: 'POST',
  //         body: formData
  //       })

  //       if (response.ok) {
  //         const updatedImage = await response.json()
  //         onImageUpdated(updatedImage) // Call the callback to update in parent
  //         console.log('Image saved successfully', updatedImage)
  //       } else {
  //         console.error('Failed to save image', response)
  //       }
  //     } catch (error) {
  //       console.error('Error saving image:', error)
  //     }
  //     closeImgEditor() // Close editor after attempting save (success or failure)
  //     return false // Prevent default save behaviour of filerobot editor
  //   },
  //   [imageId, onImageUpdated, closeImgEditor]
  // ) // Depend on imageId and onImageUpdated
  //
  const handleSave = (editedImageObject, designState) => {
    console.log('saved', editedImageObject)

    const { imageBase64, name, extension } = editedImageObject

    if (!imageBase64) {
      console.error('imageBase64 is missing in imageData')
      return
    }

    const downloadLink = document.createElement('a')
    downloadLink.href = imageBase64
    downloadLink.download = `${name}.${extension}` // Construct filename

    // Append the link to the body (it doesn't need to be visible)
    document.body.appendChild(downloadLink)
    downloadLink.click() // Programmatically click the link to trigger download

    // Remove the link from the body afterwards
    document.body.removeChild(downloadLink)
  }

  return (
    <div>
      {/* <Button onClick={() => setIsOpen(true)} disabled={!imageUrl}>
        Edit Image
      </Button> */}
      {isOpen && (
        <div style={{ height: '100vh', width: '100vw' }}>
          <FilerobotImageEditor
            source={imageUrl}
            onSave={handleSave} // Use handleSave useCallback
            onClose={onClose}
            annotationsCommon={{
              fill: '#ffffff'
            }}
            Text={{ text: 'Filerobot...' }}
            Crop={{
              presetsItems: [
                {
                  titleKey: 'classic',
                  ratio: '1 / 1'
                },
                {
                  titleKey: 'landscape',
                  ratio: '16 / 9'
                },
                {
                  titleKey: 'portrait',
                  ratio: '3 / 4'
                }
              ]
            }}
            tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.RESIZE, TABS.FILTERS, TABS.FINETUNE]}
            defaultToolId={TOOLS.CROP} // Ensure this is the correct enum value, might be 'CROP'
            savingPixelRatio={1} // Add savingPixelRatio to satisfy type
            previewPixelRatio={1} // Add previewPixelRatio to satisfy type
          />
        </div>
      )}
    </div>
  )
}

export default ImageEditor
