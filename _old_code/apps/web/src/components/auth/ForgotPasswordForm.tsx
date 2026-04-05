'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Leaf, Mail, Loader2, ArrowRight, CheckCircle2, ArrowLeft, KeyRound, Lock, EyeOff, Eye } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@agri-scan/shared'
import { authApi } from '@agri-scan/shared'
import { motion, AnimatePresence } from 'framer-motion'

export default function ForgotPasswordForm() {
  // --- STATES QUẢN LÝ CÁC BƯỚC ---
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [savedEmail, setSavedEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  
  // States cho Bước 2 (OTP) và Bước 3 (Password)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Trạng thái chung
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  // Form Bước 1 (Gửi Email)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  // --- XỬ LÝ BƯỚC 1: GỬI EMAIL LẤY OTP ---
  const onEmailSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setApiError("")
    try {
      await authApi.forgotPassword(data.email)
      setSavedEmail(data.email)
      setStep(2) // Chuyển sang bước nhập OTP
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Không thể gửi email. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- XỬ LÝ BƯỚC 2: XÁC THỰC OTP ---
  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return setApiError("Mã OTP phải có đúng 6 chữ số")
    
    setIsLoading(true)
    setApiError("")
    try {
      const res = await authApi.verifyOtp(savedEmail, otp)
      setResetToken(res.resetToken) // Lưu thẻ tạm thời để đổi mật khẩu
      setStep(3) // Chuyển sang bước nhập mật khẩu mới
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- XỬ LÝ BƯỚC 3: ĐẶT MẬT KHẨU MỚI ---
  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return setApiError("Mật khẩu xác nhận không khớp!")
    }
    
    setIsLoading(true)
    setApiError("")
    try {
      await authApi.resetPassword({ email: savedEmail, resetToken, newPassword })
      setStep(4) // Thành công hoàn toàn
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Đổi mật khẩu thất bại. Phiên có thể đã hết hạn.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
            {step === 4 ? <CheckCircle2 size={28} className="text-green-500" /> : <Leaf size={28} />}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 1 && "Quên mật khẩu?"}
            {step === 2 && "Nhập mã xác nhận"}
            {step === 3 && "Tạo mật khẩu mới"}
            {step === 4 && "Thành công!"}
          </h2>
          <p className="mt-2 text-gray-600">
            {step === 1 && "Nhập email của bạn để nhận mã OTP 6 số"}
            {step === 2 && `Mã xác nhận đã được gửi đến ${savedEmail}`}
            {step === 3 && "Vui lòng đặt mật khẩu mạnh để bảo vệ tài khoản"}
            {step === 4 && "Tài khoản của bạn đã được cập nhật mật khẩu mới"}
          </p>
        </div>

        {apiError && (
          <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center border border-red-100">
            {apiError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* BƯỚC 1: FORM NHẬP EMAIL */}
          {step === 1 && (
            <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mt-8 space-y-6" onSubmit={handleSubmit(onEmailSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-70">
                {isLoading ? <><Loader2 className="animate-spin -ml-1 mr-2" size={20} /> Đang gửi...</> : <>Gửi mã xác nhận <ArrowRight className="ml-2" size={20} /></>}
              </button>
            </motion.form>
          )}

          {/* BƯỚC 2: FORM NHẬP OTP */}
          {step === 2 && (
            <motion.form key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mt-8 space-y-6" onSubmit={onOtpSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 chữ số)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={20} />
                  </div>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} // Chỉ cho nhập số, tối đa 6
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors tracking-widest text-lg font-bold"
                    placeholder="123456"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">* Mã OTP có hiệu lực trong 60 giây</p>
              </div>

              <button type="submit" disabled={isLoading || otp.length < 6} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-70">
                {isLoading ? <><Loader2 className="animate-spin -ml-1 mr-2" size={20} /> Đang kiểm tra...</> : <>Xác nhận OTP <ArrowRight className="ml-2" size={20} /></>}
              </button>
            </motion.form>
          )}

          {/* BƯỚC 3: FORM ĐỔI MẬT KHẨU */}
          {step === 3 && (
            <motion.form key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mt-8 space-y-6" onSubmit={onPasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={20} />
                    </div>
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-70">
                {isLoading ? <><Loader2 className="animate-spin -ml-1 mr-2" size={20} /> Đang cập nhật...</> : <>Đổi mật khẩu <CheckCircle2 className="ml-2" size={20} /></>}
              </button>
            </motion.form>
          )}

          {/* BƯỚC 4: THÔNG BÁO THÀNH CÔNG */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center space-y-6">
              <Link href="/login" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-all">
                Đăng nhập ngay bằng mật khẩu mới
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nút Quay lại - Chỉ hiển thị ở bước 1 hoặc 2 */}
        {step < 3 && (
          <div className="text-center mt-6">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Quay lại đăng nhập
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}