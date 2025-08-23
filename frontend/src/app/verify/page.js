"use client"
import React, { Suspense } from 'react'
import VerifyOtp from '@/components/verifyOtp'
import Loading from '@/components/Loading'
function page() {

  return (
    <Suspense fallback={<Loading />}>
      <VerifyOtp />
    </Suspense>
  )
}

export default page
