// import { useMemo, useState } from "react";
// import {
//     FiUser,
//     FiMessageSquare,
//     FiSend,
// } from "react-icons/fi";
// import { FaStar } from "react-icons/fa";
// import { useToast } from "./ToastNotification";

// const Review = ({
//     reviews = [],
//     onSubmit,
// }) => {
//     const [name, setName] = useState("");
//     const [comment, setComment] = useState("");
//     const [rating, setRating] = useState(0);
//     const [hover, setHover] = useState(0);
//     const [loading, setLoading] = useState(false);
//     const [email, setEmail] = useState("");
//     const toast = useToast();

//     const averageRating = useMemo(() => {
//         if (!reviews.length) return 0;
//         return (
//             reviews.reduce((sum, r) => sum + r.rating, 0) /
//             reviews.length
//         ).toFixed(1);
//     }, [reviews]);

//     const distribution = useMemo(() => {
//         const counts = {
//             5: 0,
//             4: 0,
//             3: 0,
//             2: 0,
//             1: 0,
//         };

//         reviews.forEach((r) => counts[r.rating]++);

//         return counts;
//     }, [reviews]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!rating) {
//             toast.error("Please select a rating.");
//             return;
//         }

//         if (!comment.trim()) {
//             toast.error("Please enter your review.");
//             return;
//         }

//         const payload = {
//             name: name.trim() || "Anonymous",
//             email: email.trim(),
//             rating,
//             comment: comment.trim(),
//         };

//         try {
//             setLoading(true);

//             if (onSubmit) {
//                 await onSubmit(payload);
//             }

//             setName("");
//             setComment("");
//             setRating(0);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <section className="mt-16">
//             <div className="rounded-3xl border bg-white shadow-sm">

//                 {/* Header */}

//                 <div className="border-b p-6">
//                     <h2 className="text-2xl font-bold">
//                         Customer Reviews
//                     </h2>

//                     <p className="mt-1 text-gray-500">
//                         Share your experience with this product.
//                     </p>
//                 </div>

//                 <div className="grid gap-10 p-6 lg:grid-cols-[320px,1fr]">

//                     {/* LEFT */}

//                     <div>

//                         <div className="rounded-2xl border p-6 text-center">

//                             <div className="text-5xl font-bold">
//                                 {averageRating}
//                             </div>

//                             <div className="mt-3 flex justify-center gap-1">

//                                 {[1, 2, 3, 4, 5].map((star) => (
//                                     <FaStar
//                                         key={star}
//                                         className={`text-xl ${star <= Math.round(averageRating)
//                                             ? "text-yellow-400"
//                                             : "text-gray-300"
//                                             }`}
//                                     />
//                                 ))}

//                             </div>

//                             <p className="mt-2 text-sm text-gray-500">
//                                 {reviews.length} Reviews
//                             </p>

//                         </div>

//                         <div className="mt-6 space-y-3">

//                             {[5, 4, 3, 2, 1].map((star) => {

//                                 const percent = reviews.length
//                                     ? (distribution[star] / reviews.length) * 100
//                                     : 0;

//                                 return (
//                                     <div
//                                         key={star}
//                                         className="flex items-center gap-3"
//                                     >
//                                         <span className="w-3 text-sm">
//                                             {star}
//                                         </span>

//                                         <FaStar className="text-yellow-400" />

//                                         <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">

//                                             <div
//                                                 className="h-full rounded-full bg-yellow-400"
//                                                 style={{
//                                                     width: `${percent}%`
//                                                 }}
//                                             />

//                                         </div>

//                                     </div>
//                                 )

//                             })}

//                         </div>

//                     </div>

//                     {/* RIGHT */}

//                     <div>

//                         {/* FORM */}

//                         <form
//                             onSubmit={handleSubmit}
//                             className="rounded-2xl border p-6"
//                         >

//                             <h3 className="mb-5 text-lg font-semibold">
//                                 Write a Review
//                             </h3>

//                             <div className="mb-5">

//                                 <label className="mb-2 block text-sm font-medium">
//                                     Rating
//                                 </label>

//                                 <div className="flex gap-2">

//                                     {[1, 2, 3, 4, 5].map((star) => (
//                                         <button
//                                             key={star}
//                                             type="button"
//                                             onClick={() => setRating(star)}
//                                             onMouseEnter={() => setHover(star)}
//                                             onMouseLeave={() => setHover(0)}
//                                         >

//                                             <FaStar
//                                                 className={`text-3xl transition ${star <= (hover || rating)
//                                                     ? "text-yellow-400"
//                                                     : "text-gray-300"
//                                                     }`}
//                                             />

//                                         </button>
//                                     ))}

//                                 </div>

//                             </div>

//                             <div className="mb-5">

//                                 <label className="mb-2 block text-sm font-medium">
//                                     Your Name (Optional)
//                                 </label>

//                                 <div className="relative">

//                                     <FiUser className="absolute left-3 top-3 text-gray-400" />

//                                     <input
//                                         value={name}
//                                         onChange={(e) => setName(e.target.value)}
//                                         placeholder="Anonymous"
//                                         className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-black"
//                                     />

//                                 </div>

//                             </div>
//                             <div className="mb-5">
//                                 <label className="mb-2 block text-sm font-medium">
//                                     Email (Optional)
//                                 </label>

//                                 <div className="relative">
//                                     <input
//                                         type="email"
//                                         value={email}
//                                         onChange={(e) => setEmail(e.target.value)}
//                                         placeholder="example@gmail.com"
//                                         className="w-full rounded-xl border py-3 px-4 outline-none transition focus:border-black"
//                                     />
//                                 </div>

//                                 <p className="mt-2 text-xs text-gray-500">
//                                     Your email will never be shown publicly.
//                                 </p>
//                             </div>

//                             <div className="mb-6">

//                                 <label className="mb-2 block text-sm font-medium">
//                                     Review
//                                 </label>

//                                 <div className="relative">

//                                     <FiMessageSquare className="absolute left-3 top-4 text-gray-400" />

//                                     <textarea
//                                         rows={5}
//                                         value={comment}
//                                         onChange={(e) => setComment(e.target.value)}
//                                         placeholder="Tell us what you think..."
//                                         className="w-full resize-none rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-black"
//                                     />

//                                 </div>

//                             </div>

//                             <button
//                                 disabled={loading}
//                                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
//                             >

//                                 <FiSend />

//                                 {loading ? "Submitting..." : "Submit Review"}

//                             </button>

//                         </form>

//                         {/* REVIEWS */}

//                         <div className="mt-8 space-y-5">

//                             {reviews.length === 0 && (

//                                 <div className="rounded-2xl border border-dashed p-10 text-center text-gray-500">
//                                     No reviews yet.
//                                     <br />
//                                     Be the first to review this product.
//                                 </div>

//                             )}

//                             {reviews.map((review, index) => (
//                                 <div
//                                     key={index}
//                                     className="rounded-2xl border p-5"
//                                 >

//                                     <div className="flex items-start justify-between">

//                                         <div>

//                                             <h4 className="font-semibold">
//                                                 {review.name || "Anonymous"}
//                                             </h4>

//                                             <div className="mt-1 flex gap-1">

//                                                 {[1, 2, 3, 4, 5].map((star) => (
//                                                     <FaStar
//                                                         key={star}
//                                                         className={`${star <= review.rating
//                                                             ? "text-yellow-400"
//                                                             : "text-gray-300"
//                                                             }`}
//                                                     />
//                                                 ))}

//                                             </div>

//                                         </div>

//                                         <span className="text-sm text-gray-400">
//                                             {new Date(
//                                                 review.createdAt || Date.now()
//                                             ).toLocaleDateString()}
//                                         </span>

//                                     </div>

//                                     <p className="mt-4 leading-7 text-gray-600">
//                                         {review.comment}
//                                     </p>

//                                 </div>
//                             ))}

//                         </div>

//                     </div>

//                 </div>

//             </div>
//         </section>
//     );
// };

// export default Review;

import { useMemo, useState } from "react";
import { FiUser, FiMail, FiMessageSquare, FiSend, FiCheckCircle } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { useToast } from "./ToastNotification";
import ReviewImageUploader from "./ReviewImageUploader";
import ReviewImagePreview from "./ReviewImagePreview";

const Review = ({ reviews = [], onSubmit }) => {
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [reviewImage, setReviewImage] = useState(null);
    const toast = useToast();

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    }, [reviews]);

    const distribution = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((r) => counts[r.rating]++);
        return counts;
    }, [reviews]);

    // Ring progress for the average rating dial (out of 5 stars -> 0-100%)
    const ringPercent = reviews.length ? (Number(averageRating) / 5) * 100 : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rating) {
            toast.error("Please select a rating.");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please enter your review.");
            return;
        }

        // Build FormData for multipart upload
        const formData = new FormData();
        formData.append("name", name.trim() || "Anonymous");
        formData.append("email", email.trim());
        formData.append("rating", rating);
        formData.append("comment", comment.trim());
        if (reviewImage) {
            formData.append("reviewImage", reviewImage);
        }

        try {
            setLoading(true);
            if (onSubmit) await onSubmit(formData);
            setName("");
            setEmail("");
            setComment("");
            setRating(0);
            setReviewImage(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <div className="overflow-hidden rounded-3xl border border-[#E7E8EC] bg-white shadow-[0_2px_24px_rgba(15,19,32,0.05)]">

                {/* Header */}
                <div className="border-b border-[#EEF0F3] bg-gradient-to-r from-[#0F1320] to-[#1A2036] px-6 py-8 sm:px-10">
                    <h2 className=" text-2xl font-bold text-white sm:text-3xl">
                        Customer Reviews
                    </h2>
                    <p className="mt-1.5 text-sm text-white/60 sm:text-base">
                        Real feedback from people who&apos;ve made this piece part of their home.
                    </p>
                </div>

                <div className="grid gap-8 p-6 lg:grid-cols-[300px,1fr] lg:gap-10 lg:p-10">

                    {/* LEFT — rating summary */}
                    <div className="lg:sticky lg:top-6 lg:self-start">

                        <div className="rounded-2xl border border-[#EEF0F3] bg-[#F9FAFB] p-6 text-center">
                            {/* Dial */}
                            <div
                                className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full"
                                style={{
                                    background: `conic-gradient(#F5A524 ${ringPercent}%, #E7E8EC ${ringPercent}%)`,
                                }}
                            >
                                <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white">
                                    <span className="text-3xl font-bold text-[#0F1320]">
                                        {averageRating || "0.0"}
                                    </span>
                                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                        out of 5
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        className={`text-base ${star <= Math.round(averageRating) ? "text-[#F5A524]" : "text-gray-200"
                                            }`}
                                    />
                                ))}
                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                                Based on{" "}
                                <span className="font-semibold text-[#0F1320]">
                                    {reviews.length}
                                </span>{" "}
                                {reviews.length === 1 ? "review" : "reviews"}
                            </p>
                        </div>

                        {/* Distribution */}
                        <div className="mt-6 space-y-2.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = distribution[star];
                                const percent = reviews.length ? (count / reviews.length) * 100 : 0;

                                return (
                                    <div key={star} className="flex items-center gap-2.5 text-sm">
                                        <span className="w-2.5  text-gray-500">
                                            {star}
                                        </span>
                                        <FaStar className="text-xs text-[#F5A524]" />
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF0F3]">
                                            <div
                                                className="h-full rounded-full bg-[#F5A524] transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <span className="w-5 text-right text-xs text-gray-400">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT — form + reviews */}
                    <div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-2xl border border-[#EEF0F3] bg-white p-6 sm:p-7"
                        >
                            <h3 className="text-lg font-semibold text-[#0F1320]">
                                Write a Review
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Tell other shoppers how it fits your space.
                            </p>

                            {/* Rating */}
                            <div className="mt-6 mb-5">
                                <label className="mb-2 block text-sm font-medium text-[#0F1320]">
                                    Your rating
                                </label>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            className="rounded-md p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6FED]"
                                        >
                                            <FaStar
                                                className={`text-2xl transition-colors ${star <= (hover || rating) ? "text-[#F5A524]" : "text-gray-200"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#0F1320]">
                                        Name <span className="font-normal text-gray-400">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <FiUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Anonymous"
                                            className="w-full rounded-xl border border-[#E5E7EB] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/15"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#0F1320]">
                                        Email <span className="font-normal text-gray-400">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full rounded-xl border border-[#E5E7EB] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/15"
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Your email is never shown publicly.</p>

                            <div className="mt-5 mb-6">
                                <label className="mb-2 block text-sm font-medium text-[#0F1320]">
                                    Review
                                </label>
                                <div className="relative">
                                    <FiMessageSquare className="pointer-events-none absolute left-3.5 top-4 text-gray-400" />
                                    <textarea
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Tell us what you think..."
                                        className="w-full resize-none rounded-xl border border-[#E5E7EB] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/15"
                                    />
                                </div>
                            </div>

                            {/* Image Uploader */}
                            <ReviewImageUploader
                                onImageChange={setReviewImage}
                                currentImage={reviewImage}
                            />

                            <button
                                disabled={loading}
                                className="flex w-full mt-2 items-center justify-center gap-2 rounded-xl bg-[#2F6FED] py-3 font-semibold text-white transition hover:bg-[#2558c4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1320] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiSend />
                                {loading ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>

                        {/* REVIEWS LIST */}
                        <div className="mt-8 space-y-4">
                            {reviews.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-10 text-center text-gray-500">
                                    <p className="font-medium text-[#0F1320]">
                                        No reviews yet
                                    </p>
                                    <p className="mt-1 text-sm">Be the first to share your experience.</p>
                                </div>
                            )}

                            {reviews.map((review, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-[#EEF0F3] p-5 transition-shadow hover:shadow-[0_2px_16px_rgba(15,19,32,0.05)] sm:p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F1320] text-sm font-semibold text-white">
                                                {(review.name || "A").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <h4 className="font-semibold text-[#0F1320]">
                                                        {review.name || "Anonymous"}
                                                    </h4>
                                                    <FiCheckCircle
                                                        className="text-[#2F6FED]"
                                                        title="Verified purchase"
                                                    />
                                                </div>
                                                <div className="mt-1 flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FaStar
                                                            key={star}
                                                            className={`text-xs ${star <= review.rating ? "text-[#F5A524]" : "text-gray-200"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <span className="shrink-0 whitespace-nowrap  text-xs text-gray-400">
                                            {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-[15px] leading-7 text-gray-600">
                                        {review.comment}
                                    </p>

                                    {/* Review Image */}
                                    {review.image && (
                                        <ReviewImagePreview
                                            imageUrl={review.image}
                                            alt={`${review.name || "Anonymous"}'s review image`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Review;