package com.ecommerce.springboot.project.service;

import com.ecommerce.springboot.project.DAO.CustomerRepository;
import com.ecommerce.springboot.project.dto.PaymentInfo;
import com.ecommerce.springboot.project.dto.Purchase;
import com.ecommerce.springboot.project.dto.PurchaseResponse;
import com.ecommerce.springboot.project.entity.Customer;
import com.ecommerce.springboot.project.entity.Order;
import com.ecommerce.springboot.project.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CheckoutServiceImpl implements CheckoutService{


    private CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository,
                               @Value("${stripe.key.secret}") String secretKey) {
        this.customerRepository = customerRepository;

        // initialize stripe api with secret key
        Stripe.apiKey = secretKey;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {

        // retrieve the order info from dto

        Order order = purchase.getOrder();
        // generate tracking number

        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);
        // populate order with orderItems

        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));

        //populate order with billing address and shipping address

        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());
        //populate costumer with order
        Customer customer = purchase.getCustomer();
        //check if existing
        String email = customer.getEmail();
        Customer customerFromDB = customerRepository.findByEmail(email);
        if(customerFromDB != null){
            customer = customerFromDB;
        }
        customer.add(order);

        // save to database
        customerRepository.save(customer);

        // return a response
        return new PurchaseResponse(orderTrackingNumber);
    }

    private String generateOrderTrackingNumber() {
        // generate aa random UUID version 4

        return UUID.randomUUID().toString();
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {

       List<String> paymentMethodTypes = new ArrayList<>();
       paymentMethodTypes.add("card");

       Map<String, Object> params = new HashMap<>();
       params.put("amount", paymentInfo.getAmount());
       params.put("currency", paymentInfo.getCurrency());
       params.put("payment_method_types", paymentMethodTypes);
       params.put("description", "Product purchase");
       params.put("receipt_email", paymentInfo.getReceiptEmail());

        return PaymentIntent.create(params);
    }
}
