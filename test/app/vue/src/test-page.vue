<template>
  <f7-page>
    <f7-fab>Hello</f7-fab>
    <div class="navbar">Test Page</div>
    <f7-block strong>Hello</f7-block>
    <p>Button</p>
  </f7-page>
</template>
<script>
import f7Page from '../../../component-library/dist/vue/page';
import f7Block from '../../../component-library/dist/vue/block';
import f7Fab from '../../../component-library/dist/vue/fab';

export default {
  components: {
    f7Page,
    f7Block,
    f7Fab,
  },
};
</script>
