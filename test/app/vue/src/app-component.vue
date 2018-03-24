<template>
  <div id="app">
    <h1>Block</h1>
    <p>This paragraph is outside of content block. Not cool, but useful for any custom elements with custom styling.</p>

    <f7-block>
      <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
    </f7-block>

    <f7-block strong>
      <p>Here comes another text block with additional "block-strong" class. Praesent nec imperdiet diam. Maecenas vel lectus porttitor, consectetur magna nec, viverra sem. Aliquam sed risus dolor. Morbi tincidunt ut libero id sodales. Integer blandit varius nisi quis consectetur. </p>
    </f7-block>

    <f7-block-title>Block title</f7-block-title>
    <f7-block>
      <p>Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
    </f7-block>

    <f7-block-title>Another ultra long content block title</f7-block-title>
    <f7-block strong>
      <p>Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
    </f7-block>

    <f7-block-title>Inset</f7-block-title>
    <f7-block strong inset>
      <p>Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
    </f7-block>

    <f7-block-title>Tablet Inset</f7-block-title>
    <f7-block strong tablet-inset>
      <p>Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
    </f7-block>

    <f7-block-title>With Header & Footer</f7-block-title>
    <f7-block>
      <f7-block-header>Block Header</f7-block-header>
      <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
      <f7-block-footer>Block Footer</f7-block-footer>
    </f7-block>

    <f7-block-header>Block Header</f7-block-header>
    <f7-block>
      <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
    </f7-block>
    <f7-block-footer>Block Footer</f7-block-footer>

    <f7-block strong>
      <f7-block-header>Block Header</f7-block-header>
      <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
      <f7-block-footer>Block Footer</f7-block-footer>
    </f7-block>

    <f7-block-header>Block Header</f7-block-header>
    <f7-block strong>
      <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
    </f7-block>
    <f7-block-footer>Block Footer</f7-block-footer>

    <h1>Card</h1>
    <f7-block>
      <p>Cards are a great way to contain and organize your information, especially when combined with List Views. Cards can contain unique related data, like for example photos, text or links about a particular subject. Cards are typically an entry point to more complex and detailed information.</p>
    </f7-block>
    <f7-block-title>Simple Cards</f7-block-title>
    <f7-card
      content="This is a simple card with plain text, but cards can also contain their own header, footer, list view, image, or any other element."
    ></f7-card>
    <f7-card
      title="Card header"
      content="Card with header and footer. Card headers are used to display card titles and footers for additional information or just for custom actions."
      footer="Card footer"
    ></f7-card>
    <f7-card
      content="Another card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse feugiat sem est, non tincidunt ligula volutpat sit amet. Mauris aliquet magna justo. "
    ></f7-card>

    <f7-block-title>Styled Cards</f7-block-title>
    <f7-card class="demo-card-header-pic">
      <f7-card-header
        class="no-border"
        valign="bottom"
        style="background-image:url(http://lorempixel.com/1000/600/nature/3/)"
      >Journey To Mountains</f7-card-header>
      <f7-card-content>
        <p class="date">Posted on January 21, 2015</p>
        <p>Quisque eget vestibulum nulla. Quisque quis dui quis ex ultricies efficitur vitae non felis. Phasellus quis nibh hendrerit...</p>
      </f7-card-content>
      <f7-card-footer>
        <!-- <f7-link>Like</f7-link>
        <f7-link>Read more</f7-link> -->
      </f7-card-footer>
    </f7-card>
    <f7-card class="demo-card-header-pic">
      <f7-card-header
        class="no-border"
        valign="bottom"
        style="background-image:url(http://lorempixel.com/1000/600/people/6/)"
      >Journey To Mountains</f7-card-header>
      <f7-card-content>
        <p class="date">Posted on January 21, 2015</p>
        <p>Quisque eget vestibulum nulla. Quisque quis dui quis ex ultricies efficitur vitae non felis. Phasellus quis nibh hendrerit...</p>
      </f7-card-content>
      <f7-card-footer>
        <!-- <f7-link>Like</f7-link>
        <f7-link>Read more</f7-link> -->
      </f7-card-footer>
    </f7-card>

    <f7-block-title>Facebook Cards</f7-block-title>
    <f7-card class="demo-facebook-card">
      <f7-card-header class="no-border">
        <div class="demo-facebook-avatar"><img src="http://lorempixel.com/68/68/people/1/" width="34" height="34"/></div>
        <div class="demo-facebook-name">John Doe</div>
        <div class="demo-facebook-date">Monday at 3:47 PM</div>
      </f7-card-header>
      <f7-card-content :padding="false">
        <img src="http://lorempixel.com/1000/700/nature/8/" width="100%"/>
      </f7-card-content>
      <f7-card-footer class="no-border">
        <!-- <f7-link>Like</f7-link>
        <f7-link>Comment</f7-link>
        <f7-link>Share</f7-link> -->
      </f7-card-footer>
    </f7-card>
    <f7-card class="demo-facebook-card">
      <f7-card-header class="no-border">
        <div class="demo-facebook-avatar"><img src="http://lorempixel.com/68/68/people/1/" width="34" height="34"/></div>
        <div class="demo-facebook-name">John Doe</div>
        <div class="demo-facebook-date">Monday at 2:15 PM</div>
      </f7-card-header>
      <f7-card-content>
        <p>What a nice photo i took yesterday!</p><img src="http://lorempixel.com/1000/700/nature/8/" width="100%"/>
        <p class="likes">Likes: 112 &nbsp;&nbsp; Comments: 43</p>
      </f7-card-content>
      <f7-card-footer class="no-border">
        <!-- <f7-link>Like</f7-link>
        <f7-link>Comment</f7-link>
        <f7-link>Share</f7-link> -->
      </f7-card-footer>
    </f7-card>

    <f7-block-title>Cards With List View</f7-block-title>
    <f7-card>
      <f7-card-content :padding="false">
        <!-- <f7-list>
          <f7-list-item link="#">Link 1</f7-list-item>
          <f7-list-item link="#">Link 2</f7-list-item>
          <f7-list-item link="#">Link 3</f7-list-item>
          <f7-list-item link="#">Link 4</f7-list-item>
          <f7-list-item link="#">Link 5</f7-list-item>
        </f7-list> -->
      </f7-card-content>
    </f7-card>
    <f7-card title="New Reelases">
      <f7-card-content :padding="false">
        <!-- <f7-list medial-list>
          <f7-list-item
            title="Yellow Submarine"
            subtitle="Beatles"
          >
            <img slot="media" src="http://lorempixel.com/88/88/fashion/4" width="44"/>
          </f7-list-item>
          <f7-list-item
            title="Don't Stop Me Now"
            subtitle="Queen"
          >
            <img slot="media" src="http://lorempixel.com/88/88/fashion/5" width="44"/>
          </f7-list-item>
          <f7-list-item
            title="Billie Jean"
            subtitle="Michael Jackson"
          >
            <img slot="media" src="http://lorempixel.com/88/88/fashion/6" width="44"/>
          </f7-list-item>
        </f7-list> -->
      </f7-card-content>
      <f7-card-footer>
        <span>January 20, 2015</span>
        <span>5 comments</span>
      </f7-card-footer>
    </f7-card>

    <h1>Grid</h1>
    <f7-block>
      <p>Columns within a row are automatically set to have equal width. Otherwise you can define your column with pourcentage of screen you want.</p>
    </f7-block>
    <f7-block-title>Columns with gap</f7-block-title>
    <f7-block>
      <f7-row>
        <f7-col>50% (.col)</f7-col>
        <f7-col>50% (.col)</f7-col>
      </f7-row>
      <f7-row>
        <f7-col>25% (.col)</f7-col>
        <f7-col>25% (.col)</f7-col>
        <f7-col>25% (.col)</f7-col>
        <f7-col>25% (.col)</f7-col>
      </f7-row>
      <f7-row>
        <f7-col>33% (.col)</f7-col>
        <f7-col>33% (.col)</f7-col>
        <f7-col>33% (.col)</f7-col>
      </f7-row>
      <f7-row>
        <f7-col>20% (.col)</f7-col>
        <f7-col>20% (.col)</f7-col>
        <f7-col>20% (.col)</f7-col>
        <f7-col>20% (.col)</f7-col>
        <f7-col>20% (.col)</f7-col>
      </f7-row>
      <f7-row>
        <f7-col width="33">33% (.col-33)</f7-col>
        <f7-col width="66">66% (.col-66)</f7-col>
      </f7-row>
      <f7-row>
        <f7-col width="25">25% (.col-25)</f7-col>
        <f7-col width="25">25% (.col-25)</f7-col>
        <f7-col width="50">50% (.col-50)</f7-col>
      </f7-row>
      <f7-row>
        <f7-col width="75">75% (.col-75)</f7-col>
        <f7-col width="25">25% (.col-25)</f7-col>
      </f7-row>
      <f7-row>
        <f7-col width="80">80% (.col-80)</f7-col>
        <f7-col width="20">20% (.col-20)</f7-col>
      </f7-row>
    </f7-block>
    <f7-block-title>No gap between columns</f7-block-title>
    <f7-block>
      <f7-row no-gap>
        <f7-col>50% (.col)</f7-col>
        <f7-col>50% (.col)</f7-col>
      </f7-row>
      <f7-row no-gap>
        <f7-col>25% (.col)</f7-col>
        <f7-col>25% (.col)</f7-col>
        <f7-col>25% (.col)</f7-col>
        <f7-col>25% (.col)</f7-col>
      </f7-row>
      <f7-row no-gap>
        <f7-col>33% (.col)</f7-col>
        <f7-col>33% (.col)</f7-col>
        <f7-col>33% (.col)</f7-col>
      </f7-row>
      <f7-row no-gap>
        <f7-col>20% (.col)</f7-col>
        <f7-col>20% (.col)</f7-col>
        <f7-col>20% (.col)</f7-col>
        <f7-col>20% (.col)</f7-col>
        <f7-col>20% (.col)</f7-col>
      </f7-row>
      <f7-row no-gap>
        <f7-col width="33">33% (.col-33)</f7-col>
        <f7-col width="66">66% (.col-66)</f7-col>
      </f7-row>
      <f7-row no-gap>
        <f7-col width="25">25% (.col-25)</f7-col>
        <f7-col width="25">25% (.col-25)</f7-col>
        <f7-col width="50">50% (.col-50)</f7-col>
      </f7-row>
      <f7-row no-gap>
        <f7-col width="75">75% (.col-75)</f7-col>
        <f7-col width="25">25% (.col-25)</f7-col>
      </f7-row>
      <f7-row no-gap>
        <f7-col width="80">80% (.col-80)</f7-col>
        <f7-col width="20">20% (.col-20)</f7-col>
      </f7-row>
    </f7-block>

    <f7-block-title>Nested</f7-block-title>
    <f7-block>
      <f7-row>
        <f7-col>50% (.col)
          <f7-row>
            <f7-col>50% (.col)</f7-col>
            <f7-col>50% (.col)</f7-col>
          </f7-row>
        </f7-col>
        <f7-col>50% (.col)
          <f7-row>
            <f7-col width="33">33% (.col-33)</f7-col>
            <f7-col width="66">66% (.col-66)</f7-col>
          </f7-row>
        </f7-col>
      </f7-row>
    </f7-block>

    <f7-block-title>Responsive Grid</f7-block-title>
    <f7-block>
      <p>Grid cells have different size on Phone/Tablet</p>
      <f7-row>
        <f7-col width="100" tablet-width="50">.col-100.tablet-50</f7-col>
        <f7-col width="100" tablet-width="50">.col-100.tablet-50</f7-col>
      </f7-row>
      <f7-row>
        <f7-col width="50" tablet-width="25">.col-50.tablet-25</f7-col>
        <f7-col width="50" tablet-width="25">.col-50.tablet-25</f7-col>
        <f7-col width="50" tablet-width="25">.col-50.tablet-25</f7-col>
        <f7-col width="50" tablet-width="25">.col-50.tablet-25</f7-col>
      </f7-row>
      <f7-row>
        <f7-col width="100" tablet-width="40">.col-100.tablet-40</f7-col>
        <f7-col width="50" tablet-width="60">.col-50.tablet-60</f7-col>
        <f7-col width="50" tablet-width="66">.col-50.tablet-66</f7-col>
        <f7-col width="100" tablet-width="33">.col-100.tablet-33</f7-col>
      </f7-row>
    </f7-block>

    <h1>Chips</h1>
    <f7-block-title>Chips With Text</f7-block-title>
    <f7-block strong>
      <f7-chip text="Example Chip"></f7-chip>
      <f7-chip text="Another Chip"></f7-chip>
      <f7-chip text="One More Chip"></f7-chip>
      <f7-chip text="Fourth Chip"></f7-chip>
      <f7-chip text="Last One"></f7-chip>
    </f7-block>
    <f7-block-title>Icon Chips</f7-block-title>
    <f7-block strong>
      <f7-chip text="Add Contact" :media-bg-color="$theme.md ? 'blue' : undefined">
        <f7-icon size="50" slot="media" if-ios="f7:add_round" if-md="material:add_circle"></f7-icon>
      </f7-chip>
      <f7-chip text="London" :media-bg-color="$theme.md ? 'green' : undefined">
        <f7-icon slot="media" if-ios="f7:compass" if-md="material:location_on"></f7-icon>
      </f7-chip>
      <f7-chip text="John Doe" :media-bg-color="$theme.md ? 'red' : undefined">
        <f7-icon slot="media" if-ios="f7:person" if-md="material:person"></f7-icon>
      </f7-chip>
    </f7-block>
    <f7-block-title>Contact Chips</f7-block-title>
    <f7-block strong>
      <f7-chip text="Jane Doe">
        <img slot="media" src="http://lorempixel.com/100/100/people/9/"/>
      </f7-chip>
      <f7-chip text="John Doe">
        <img slot="media" src="http://lorempixel.com/100/100/people/3/"/>
      </f7-chip>
      <f7-chip text="Adam Smith">
        <img slot="media" src="http://lorempixel.com/100/100/people/7/"/>
      </f7-chip>
      <f7-chip text="Jennifer" media-bg-color="pink" media="J"></f7-chip>
      <f7-chip text="Chris" media-bg-color="yellow" media-text-color="black" media="C"></f7-chip>
      <f7-chip text="Kate" media-bg-color="red" media="K"></f7-chip>
    </f7-block>
    <f7-block-title>Deletable Chips / Tags</f7-block-title>
    <f7-block strong>
      <f7-chip text="Example Chip" deleteable @delete="deleteChip"></f7-chip>
      <f7-chip text="Chris" media="C" media-bg-color="orange" text-color="black" deleteable @delete="deleteChip"></f7-chip>
      <f7-chip text="Jane Doe" deleteable @delete="deleteChip">
        <img slot="media" src="http://lorempixel.com/100/100/people/9/"/>
      </f7-chip>
      <f7-chip text="One More Chip" deleteable @delete="deleteChip"></f7-chip>
      <f7-chip text="Jennifer" media-bg-color="pink" media="J" deleteable @delete="deleteChip"></f7-chip>
      <f7-chip text="Adam Smith" deleteable @delete="deleteChip">
        <img slot="media" src="http://lorempixel.com/100/100/people/7/"/>
      </f7-chip>
    </f7-block>
    <f7-block-title>Color Chips</f7-block-title>
    <f7-block strong>
      <f7-chip text="Red Chip" color="red"></f7-chip>
      <f7-chip text="Green Chip" color="green"></f7-chip>
      <f7-chip text="Blue Chip" color="blue"></f7-chip>
      <f7-chip text="Orange Chip" color="orange"></f7-chip>
      <f7-chip text="Pink Chip" color="pink"></f7-chip>
    </f7-block>

    <h1>Accordion</h1>
    <f7-block-title>Custom Collapsible</f7-block-title>
    <F7Block inner accordion-list>
      <f7-accordion-item v-for="n in 3" :key="n" @accordion:opened="onAccordionOpened" @accordion:closed="onAccordionClosed">
        <f7-accordion-toggle><b>Item {{n}}</b></f7-accordion-toggle>
        <f7-accordion-content>Content {{n}}</f7-accordion-content>
      </f7-accordion-item>
    </F7Block>

    <!-- FAB -->
    <f7-fab>
      <i slot="link" class="icon f7-icons ios-only">add</i>
      <i slot="link" class="icon f7-icons ios-only">close</i>
      <i slot="link" class="icon material-icons md-only">add</i>
      <i slot="link" class="icon material-icons md-only">close</i>
      <f7-fab-buttons>
        <f7-fab-button>1</f7-fab-button>
        <f7-fab-button>2</f7-fab-button>
        <f7-fab-button>3</f7-fab-button>
      </f7-fab-buttons>
    </f7-fab>
  </div>
</template>

<script>
  import F7Badge from '../../../component-library/dist/vue/components/badge';
  import F7BlockTitle from '../../../component-library/dist/vue/components/block-title';
  import F7Block from '../../../component-library/dist/vue/components/block';
  import F7BlockHeader from '../../../component-library/dist/vue/components/block-header';
  import F7BlockFooter from '../../../component-library/dist/vue/components/block-footer';
  import F7Card from '../../../component-library/dist/vue/components/card';
  import F7CardHeader from '../../../component-library/dist/vue/components/card-header';
  import F7CardFooter from '../../../component-library/dist/vue/components/card-footer';
  import F7CardContent from '../../../component-library/dist/vue/components/card-content';
  import F7Row from '../../../component-library/dist/vue/components/row';
  import F7Col from '../../../component-library/dist/vue/components/col';
  import F7Chip from '../../../component-library/dist/vue/components/chip';
  import F7Icon from '../../../component-library/dist/vue/components/icon';
  import F7AccordionItem from '../../../component-library/dist/vue/components/accordion-item';
  import F7AccordionToggle from '../../../component-library/dist/vue/components/accordion-toggle';
  import F7AccordionContent from '../../../component-library/dist/vue/components/accordion-content';
  import F7Accordion from '../../../component-library/dist/vue/components/accordion';
  import F7Fab from '../../../component-library/dist/vue/components/fab';
  import F7FabButtons from '../../../component-library/dist/vue/components/fab-buttons';
  import F7FabButton from '../../../component-library/dist/vue/components/fab-button';

  export default {
    components: {
      F7Badge,
      F7BlockTitle,
      F7Block,
      F7BlockHeader,
      F7BlockFooter,
      F7Card,
      F7CardHeader,
      F7CardFooter,
      F7CardContent,
      F7Row,
      F7Col,
      F7Chip,
      F7Icon,
      F7AccordionItem,
      F7AccordionToggle,
      F7AccordionContent,
      F7Accordion,
      F7Fab,
      F7FabButtons,
      F7FabButton,
    },
    methods: {
      deleteChip() {
        alert('Delete chip!');
      },
      onAccordionOpened() {
        alert('Accordion opened');
      },
      onAccordionClosed() {
        alert('Accordion closed');
      }
    }
  };
</script>