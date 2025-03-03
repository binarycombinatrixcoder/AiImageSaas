'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Client } from '@gradio/client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from '@/constants'
import { CustomField } from './CustomField'
import { useEffect, useState, useTransition } from 'react'
import { AspectRatioKey, debounce, deepMergeObjects } from '@/lib/utils'
import MediaUploader from './MediaUploader'
import TransformedImage from './TransformedImage'
import { updateCredits } from '@/lib/actions/user.actions'
import { getCldImageUrl } from 'next-cloudinary'
import { addImage, updateImage } from '@/lib/actions/image.actions'
import { addImageFromUrl } from '@/lib/actions/image.actions' // ADD THIS LINE
import { useRouter } from 'next/navigation'
import { InsufficientCreditsModal } from './InsufficientCreditsModal'

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
  width: z.string().optional(),
  height: z.string().optional(),
})

const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) => {
  const transformationType = transformationTypes[type]
  const [showLoader, setShowLoader] = useState(false)
  const [image, setImage] = useState(data)
  const [outUrl, setOutUrl] = useState('')
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformationConfig, setTransformationConfig] = useState(config)
  const [isPending, startTransition] = useTransition()
  const [generatedImageBlob, setGeneratedImageBlob] = useState<Blob | null>(null); // State to hold generated image Blob
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null) // State to hold generated image URL
  const router = useRouter()

  const initialValues =
    data && action === 'Update'
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
          width: data?.width,
          height: data?.height
        }
      : defaultValues

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
  })

  // New onSubmit function
  async function onSubmitAndUpload(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if (generatedImageBlob) {
      try {
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;

          const newImage = await addImageFromUrl({
            image: {
              title: values.title,
              publicId: values.publicId,
              transformationType: type,
              width: values.width ? parseInt(values.width) : 0,
              height: values.height ? parseInt(values.height) : 0,
              config: transformationConfig,
              secureURL: '',
              transformationURL: '',
              aspectRatio: values.aspectRatio,
              prompt: values.prompt,
              color: values.color,
              // blob: generatedImageBlob,
              base64: base64String, // Send the Base64 string to the server
            },
            userId: userId,
            path: '/',
          });

          if (newImage) {
            form.reset();
            setImage(data);
            router.push(`/transformations/${newImage._id}`);
          }
        };
        reader.readAsDataURL(generatedImageBlob);
      } catch (error) {
        console.error("Error adding image from URL:", error);
        alert("Error saving generated image. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error("No image generated. generatedImageBlob is undefined.");
      alert("No image generated. Please generate an image first.");
      setIsSubmitting(false);
    }
  }

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitAndUpload(values)
    setIsSubmitting(false)
  }

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey]

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height
    }))

    setNewTransformation(transformationType.config)

    return onChangeField(value)
  }

  const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === 'prompt' ? 'prompt' : 'to']: value
        }
      }))
    }, 1000)()

    return onChangeField(value)
  }

  const onTransformHandler = async () => {
    debugger
    setIsTransforming(true)

    setTransformationConfig(deepMergeObjects(newTransformation, transformationConfig))

    setNewTransformation(null)

    startTransition(async () => {
      await updateCredits(userId, creditFee)
    })
  }

  const onGenerateHandler = async () => {
    setShowLoader(true);
    setGeneratedImageUrl(null); // Clear previous image
    setGeneratedImageBlob(null); // Clear previous image blob

    const values = form.getValues();
    const promptValue = values.title;
    const widthValue = values.width;
    const heightValue = values.height;

    console.log('promptValue', values);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: promptValue, width: widthValue, height: heightValue }) // Send prompt in body
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.imageUrl) {
        console.log('Image URL from API:', data.imageUrl);
        setGeneratedImageUrl(data.imageUrl); // Set generated image URL state

        // Convert image URL to Blob
        try {
          const blobResponse = await fetch(data.imageUrl);
          const blob = await blobResponse.blob();
          setGeneratedImageBlob(blob); // Set generated image Blob state
          console.log('Generated image blob set successfully.');
        } catch (blobError) {
          console.error("Error converting image URL to Blob:", blobError);
          alert("Error converting image to Blob. Please try again.");
        }
      } else {
        console.error('Error from API:', data.error || 'No image URL in response');
        alert('Error generating image, please try again');
      }
    } catch (error) {
      console.error('Error calling API:', error);
      alert('Error generating image, please try again');
    } finally {
      setShowLoader(false);
    }
  }

  useEffect(() => {
    if (image && (type === 'restore' || type === 'removeBackground')) {
      setNewTransformation(transformationType.config)
    }
  }, [image, transformationType.config, type])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />
         <CustomField
          control={form.control}
          name="width"
          formLabel="Image Width"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />
         <CustomField
          control={form.control}
          name="height"
          formLabel="Image Height"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === 'fill' && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select onValueChange={(value) => onSelectFieldHandler(value, field.onChange)} value={field.value}>
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={type === 'remove' ? 'Object to remove' : 'Object to recolor'}
              className="w-full"
              render={({ field }) => (
                <Input value={field.value} className="input-field" onChange={(e) => onInputChangeHandler('prompt', e.target.value, type, field.onChange)} />
              )}
            />

            {type === 'recolor' && (
              <CustomField
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    className="input-field"
                    onChange={(e) => onInputChangeHandler('color', e.target.value, 'recolor', field.onChange)}
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="image-field">
          {/* <CustomField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => <MediaUploader onValueChange={field.onChange} setImage={setImage} publicId={field.value} image={image} type={type} />}
          /> */}

          {/* <TransformedImage
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          /> */}
          <div className="generated-image">
            {generatedImageUrl && <img src={generatedImageUrl} alt="Generated Image" className="max-w-full max-h-96" />}
            {showLoader && <p>Loading...</p>} {/* Optional loading indicator */}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button type="button" className="submit-button capitalize" disabled={isTransforming} onClick={onGenerateHandler}>
            {isTransforming ? 'Transforming...' : 'Apply Transformation'}
          </Button>
          <Button type="submit" className="submit-button capitalize" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save Image'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default TransformationForm
