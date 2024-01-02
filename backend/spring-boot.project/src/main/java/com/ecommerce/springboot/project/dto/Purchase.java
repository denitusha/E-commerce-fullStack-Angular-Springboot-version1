package com.ecommerce.springboot.project.dto;

import com.ecommerce.springboot.project.entity.Address;
import com.ecommerce.springboot.project.entity.Customer;
import com.ecommerce.springboot.project.entity.Order;
import com.ecommerce.springboot.project.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {

    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;

    public Purchase(Customer customer, Address shippingAddress, Address billingAddress, Order order, Set<OrderItem> orderItems) {
        this.customer = customer;
        this.shippingAddress = shippingAddress;
        this.billingAddress = billingAddress;
        this.order = order;
        this.orderItems = orderItems;
    }
}
