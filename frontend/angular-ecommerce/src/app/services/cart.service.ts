import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  decrementQuantity(tempCartItem: CartItem) {
    tempCartItem.quantity--;
    if (tempCartItem.quantity === 0) {
      this.remove(tempCartItem);
    } else {
      this.computeCartTotals()
    }
  }
  remove(tempCartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(cartItem => cartItem.id === tempCartItem.id)
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }


  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  storage: Storage = localStorage;


  constructor() {
    let data = JSON.parse(this.storage.getItem('cartItems'));

    if (data != null) {
      this.cartItems = data;

      this.computeCartTotals();
    }
  }


  addToCart(theCartItem: CartItem) {
    // check if already have item in cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined;

    if (this.cartItems.length > 0) {
      // find the item based on id
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
    }

    // check if we found it
    alreadyExistsInCart = !!existingCartItem;

    if (alreadyExistsInCart) {
      // Initialize quantity to 1 if it's undefined, otherwise increment
      existingCartItem!.quantity = (existingCartItem!.quantity || 0) + 1;
    } else {
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();

  }
  computeCartTotals() {
    let totalPrice: number = 0;
    let itemsInCart: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPrice += currentCartItem.quantity * currentCartItem.unitPrice;
      itemsInCart += currentCartItem.quantity;
    }

    // publish new data
    this.totalPrice.next(totalPrice);
    this.totalQuantity.next(itemsInCart);

    this.persistCartItems();
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

}
