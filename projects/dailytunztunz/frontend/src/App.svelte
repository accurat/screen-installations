<script>
  import { musicData } from './store'
  import { World } from './World'
  const world = new World()
  $: console.log($musicData)
  export let name
</script>

<style>

</style>

<canvas />
