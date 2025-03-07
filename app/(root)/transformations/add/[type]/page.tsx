import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm'
import GenerateImage from '@/components/shared/GenerateImage'
import { transformationTypes } from '@/constants'
import { getUserById } from '@/lib/actions/user.actions'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  // const { userId } = await auth();
  const { userId }: { userId: string | null } = await auth()
  const transformation = transformationTypes[type]

  if (!userId) redirect('/sign-in')

  const user = await getUserById(userId)

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        {type == 'generate' ? (
          <GenerateImage action="Add" userId={user._id} type={transformation.type as TransformationTypeKey} creditBalance={user.creditBalance} />
        ) : (
          <TransformationForm action="Add" userId={user._id} type={transformation.type as TransformationTypeKey} creditBalance={user.creditBalance} />
        )}
      </section>
    </>
  )
}

export default AddTransformationTypePage
