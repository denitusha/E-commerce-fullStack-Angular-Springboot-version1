import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Address } from 'src/app/common/address';
import { Country } from 'src/app/common/country';
import { Customer } from 'src/app/common/customer';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormServiceService } from 'src/app/services/form-service.service';
import { CustomValidators } from 'src/app/validators/validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  itemsInCart: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  //initialize stripe api
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private formService: FormServiceService, private cartService: CartService,
    private checkoutService: CheckoutService, private router: Router
  ) { }

  ngOnInit(): void {

    // setup stripe form
    this.setupStripePaymentForm();
    this.reviewCartDetails();

    // read email from session stoRAGE
    const email = JSON.parse(this.storage.getItem('userEmail')!);
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl("",
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        lastName: new FormControl("",
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        email: new FormControl(email,
          [Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl("",
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        city: new FormControl("",
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        state: new FormControl("",
          [Validators.required]),
        country: new FormControl("",
          [Validators.required]),
        zipCode: new FormControl("",
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl("",
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        city: new FormControl("",
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        state: new FormControl("",
          [Validators.required]),
        country: new FormControl("",
          [Validators.required]),
        zipCode: new FormControl("",
          [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace])
      })
      // creditCard: this.formBuilder.group({
      //   cardType: new FormControl("",
      //     [Validators.required]),
      //   nameOnCard: new FormControl("",
      //     [Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
      //   cardNumber: new FormControl("",
      //     [Validators.required, Validators.pattern('[0-9]{16}')]),
      //   securityCode: new FormControl("",
      //     [Validators.required, Validators.pattern('[0-9]{3}')]),
      //   expirationMonth: [""],
      //   expirationYear: [""]

      // })
    })

    // // populate creddit card months

    // const startMonth: number = new Date().getMonth() + 1;

    // this.formService.getCreditCardMonths(startMonth).subscribe(
    //   data => {
    //     this.creditCardMonths = data;
    //   }
    // )

    // // populate creddit card months



    // this.formService.getCreditCardYears().subscribe(
    //   data => {
    //     this.creditCardYears = data;
    //   }
    // )



    //populate countries

    this.formService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    )
  }


  setupStripePaymentForm() {
    // get a handle to stripe leements
    var elements = this.stripe.elements();
    // create a card element
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // add an instance of card ui component into the card element div
    this.cardElement.mount('#card-element');

    // add event binding for the change event on card elemnt
    this.cardElement.on('change', (event: any) => {
      // get a handle to card-errors element

      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    })
  }


  reviewCartDetails() {

    // subscribe to cartservice . total price
    this.cartService.totalQuantity.subscribe(
      itemsInCart => this.itemsInCart = itemsInCart
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName')
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName')
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email')
  }
  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street')
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city')
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state')
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country')
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode')
  }
  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street')
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city')
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state')
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country')
  }
  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode')
  }
  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType')
  }
  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard')
  }
  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber')
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode')
  }



  onSubmit() {

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order(this.itemsInCart, this.totalPrice);
    // get cart items
    const cartItems = this.cartService.cartItems;
    // create orderItems from cartitems
    let orderItems: OrderItem[] = cartItems.map(
      tempCartItem => new OrderItem(
        tempCartItem.imageUrl,
        tempCartItem.unitPrice,
        tempCartItem.quantity,
        tempCartItem.id));



    //populate purchase - customer

    const customer: Customer = this.checkoutFormGroup.controls['customer'].value;
    // populate purchase - shipping address

    const shippingAddress: Address = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(shippingAddress.country));
    shippingAddress.state = shippingState.name;
    shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address

    const billingAddress: Address = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(billingAddress.country));
    billingAddress.state = billingState.name;
    billingAddress.country = billingCountry.name;
    // set up purchase
    const purchase: Purchase = new Purchase(
      customer,
      shippingAddress,
      billingAddress,
      order,
      orderItems);

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;
    // if valid form create intent 
    // confirm payment
    // place order

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {
      this.isDisabled = true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry.value.code
                  }
                }
              }
            }, { handleActions: false }
          )
            .then((result: any) => {
              if (result.error) {
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              } else {
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

                    this.resetCart();
                    this.isDisabled = false;

                  },
                  error: (err: any) => {
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false;
                  }
                })
              }
            });
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

  }
  resetCart() {
    //reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    //reset the form
    this.checkoutFormGroup.reset();

    //navigate to products page
    this.router.navigateByUrl("/products");
  }


  copyShippingAddressToBillingAddress(event: Event) {
    const shippingAddress = this.checkoutFormGroup.get('shippingAddress');
    const billingAddress = this.checkoutFormGroup.get('billingAddress');

    if (shippingAddress && billingAddress) {
      if ((event.target as HTMLInputElement).checked) {
        // Copy values from shippingAddress to billingAddress
        billingAddress.patchValue(shippingAddress.value);

        this.billingAddressStates = this.shippingAddressStates;
      } else {
        // Reset fields in billingAddress
        billingAddress.reset();

        this.billingAddressStates = [];
      }
    }
  }

  handleMonthAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup!.value.expirationYear);

    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.formService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    )
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);


    const countryCode = formGroup!.value.country.code;

    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    )

  }


}
