<script>
  import { musicData } from './store'
  $: console.log($musicData)
  export let name
</script>

<style>
  h1 {
    color: purple;
  }
</style>

<h1>Hello {name}!</h1>
