package com.ecommerce.springboot.project.service;

import com.ecommerce.springboot.project.dto.PaymentInfo;
import com.ecommerce.springboot.project.dto.Purchase;
import com.ecommerce.springboot.project.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.stereotype.Service;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;
}
