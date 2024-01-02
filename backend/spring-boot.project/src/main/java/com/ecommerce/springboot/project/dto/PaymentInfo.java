package com.ecommerce.springboot.project.dto;

import lombok.Data;

@Data
public class PaymentInfo {
    private int amount;
    private String currency;
    private  String receiptEmail;

    public PaymentInfo(int amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }
}
