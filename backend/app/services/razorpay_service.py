import razorpay

from app.config import settings


class RazorpayService:
    def __init__(self):
        self.client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

    def create_order(
        self,
        amount: int,
        receipt: str,
        currency: str = "INR",
    ):
        data = {
            "amount": amount,
            "currency": currency,
            "receipt": receipt,
            "payment_capture": 1,
        }

        return self.client.order.create(data)

    def verify_payment(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:

        try:
            self.client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )

            return True

        except razorpay.errors.SignatureVerificationError:
            return False

    def verify_webhook(
        self,
        body: bytes,
        signature: str,
    ) -> bool:

        try:
            self.client.utility.verify_webhook_signature(
                body,
                signature,
                settings.RAZORPAY_WEBHOOK_SECRET,
            )

            return True

        except razorpay.errors.SignatureVerificationError:
            return False


razorpay_service = RazorpayService()