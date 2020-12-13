var eventBus = new Vue()

Vue.component('product',{
	props: {
		premium: {
			type: Boolean,
			required: true
		}
	},
	template: `
		<div class="product">
			<div class="product-image">
				<img v-bind:src="image">
				<br>
				<a :href="link" target="_blanck"> Más productos como este. </a>
			</div>
			<div class="product-info">
				<!--<h1>{{ brand }} {{ product }}</h1> -->
				<h1>{{ title }}</h1>
				<p v-if="inventory > 100">Disponible!</p>
				<p v-else-if="inventory < 10 && inventory > 0">Menos de 10!</p>
				<p v-else>Agotado!</p>

				<p>{{ sale }}</p>

				<p>User is premium: {{ premium }}</p>



				<p>Shipping: {{ shipping }}</p>

				<p v-if="inStock">Disponible!</p>
				<p v-else :class="{outOfStock: !inStock}">Agotado!</p>
				<span v-if="onSale">En Venta</span>

				<ul>
					 <product-details :details="details"></product-details>
				</ul>
				<div v-for="(variant, index) in variants" :key="variant.variantId"
					class="color-box"
					:style="{ backgroundColor: variant.variantColor }"
					@mouseover="updateProduct(index)">
				</div>
				<ul>
					<li v-for="size in sizes">
	                   {{ size }}
					</li>
				</ul>

				<button v-on:click="addToCart" >
					Añadir al carrito
				</button>
				<!--  <button v-on:click="addToCart"
					:disabled="!inStock"
					:class="{disabledButton: !inStock}">
						Añadir al carrito
					</button> -->
				<button @click="removeFromCart">
	            	Remove from cart
	            </button>

	            <product-tabs :reviews="reviews"></product-tabs>

			</div>
		</div>
	`,
	data () {
		return {
			brand: 'Vue Mastery',
			product:'CALCETINES',
			//image:'./masterimg/vmSocks-green-onWhite.jpg',
			link:'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
			inventory: 101,
			selectedVariant: 0,
			//inStock:false,
			onSale: true,
			details: ["80% decuento", "20% poliester","Genero neutral"],
			variants: [
				{
					variantId: 2234,
					variantColor: "green",
					variantImage: './masterimg/vmSocks-green-onWhite.jpg',
					variantQuantity: 0
				},
				{
					variantId: 2235,
					variantColor: "blue",
					variantImage: './masterimg/vmSocks-blue-onWhite.jpg',
					variantQuantity: 0
				}
			],
			sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
			reviews: []
		}
	},
	methods: {
		addToCart: function (){
			this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
		},
		updateProduct: function (index){
			this.selectedVariant = index
			console.log(index)
		},
        removeFromCart: function() {
             this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        }
	},
	computed: {
		title() {
			return this.brand + ' ' +this.product
		},
		image() {
			return this.variants[this.selectedVariant].variantImage
		},
		inStock(){
			return this.variants[this.selectedVariant].variantQuantity
		},
        sale() {
          if (this.onSale) {
            return this.brand + ' ' + this.product + ' are on sale!'
          }
            return  this.brand + ' ' + this.product + ' are not on sale'
        },
        shipping(){
        	if(this.premium){
        		return "Free"
        	}
        	return 2.99
        },
        mounted() {
        	eventBus.$on('review-submitted', productReview => {
        		this.reviews.push(productReview)
        	})
        }
	}
})

Vue.component('product-review', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">

		<p v-if="errors.length">
			<b>Por favor corrige los error(s):</b>
			<ul>
				<li v-for="error in errors">{{error}}</li>
			</ul>
		</p>

    	<p>
    		<label form="name">Name:</label>
    		<input id="name" v-model="name">
    	</p>
    	<p>
    		<label for="review">Review:</label>
    		<textarea id="review" v-model="review"> </textarea>
    	</p>

		<p>
		<label for="rating">Rating:</label>
		<select id="rating" v-model.number="rating">
			<option>5</option>
			<option>4</option>
			<option>3</option>
			<option>2</option>
			<option>1</option>
		</select>
		</p>

		 <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input type="radio" value="No" v-model="recommend"/>
        </label>

		<p>
			<input type="submit" value="Submit">
		</p>

	</form>

  `,
  data() {
  	return {
  		name: null,
  		review: null,
  		rating: null,
        recommend: null,
  		errors: []
  	}
  },
  methods: {
  	onSubmit() {
	  	if(this.name && this.review && this.rating && this.recommend)	{
	  		let productReview = {
	  			name: this.name,
	  			review: this.review,
	  			rating: this.rating,
            	recommend: this.recommend
	  		}
	  		eventBus.$emit('review-submitted', productReview)
	  		this.name=null,
			this.review=null,
			this.rating=null,
			this.recommend=null
		}else{
			if(!this.name) this.errors.push("Nombre requerido.")
			if(!this.review) this.errors.push("Review requerido.")
			if(!this.rating) this.errors.push("Rating requerido.")
			if(!this.recommend) this.errors.push("Recommend requerido.")
		}
  	}
  }
})

Vue.component('product-tabs', {
	props: {
		reviews: {
			type:Array,
			required: true
		}
	},
	template: `
		<div>
			<span class="tab"
			:class="{ activeTab: selectedTab === tab}"
			v-for="(tab, index) in tabs" :key="index"
			@click="selectedTab = tab"
			>{{tab}}</span>

				<div v-show="selectedTab === 'Reviews'" >
					<h2>Reviews</h2>
					<p v-if="!reviews.length">There are no reviews yet.</p>
					<ul>
						<li v-for="review in reviews">
							<p>{{ review.name }}</p>
							<p>Rating: {{ review.rating }}</p>
							<p>{{ review.review }}</p>
						</li>
					</ul>
				</div>
	            <div v-show="selectedTab === 'Make a Review'">
	            	<product-review></product-review>
				</div>
		</div>`,
	data() {
		return {
			tabs: ['Reviews', 'Make a Review'],
			selectedTab: 'Reviews'
		}
	}
})
Vue.component('info-tabs', {
    props: {
      shipping: {
        required: true
      },
      details: {
        type: Array,
        required: true
      }
    },
    template: `
      <div>

        <ul>
          <span class="tabs"
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>

      </div>
    `,
    data() {
      return {
        tabs: ['Shipping', 'Details'],
        selectedTab: 'Shipping'
      }
    }
  })

Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})






var app = new Vue({
	el: '#app',
	data: {
		premium: false,
		cart: []
	},
	methods: {
		updateCart(id) {
			this.cart.push(id)
		},
        removeItem(id) {
          for(var i = this.cart.length - 1; i >= 0; i--) {
            if (this.cart[i] === id) {
               this.cart.splice(i, 1);
            }
          }
        }
	}
})


