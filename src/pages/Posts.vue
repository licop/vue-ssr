<template>
  <div>
    <h1>Post List</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'PostList',
  metaInfo: {
    title: 'Posts'
  },
  data () {
    return {
      // posts: []
    }
  },
  computed: {
    ...mapState(['posts'])
  },

  // Vue SSR 特殊为服务端渲染提供的一个生命周期钩子函数
  serverPrefetch () {
    // 发起 action，返回 Promise
    // this.$store.dispatch('getPosts')
    return this.getPosts()
  },
  methods: {
    ...mapActions(['getPosts'])
  },
  // 服务端渲染
  //     只支持 beforeCreate 和 created
  //     不会等待 beforeCreate 和 created 中的异步操作
  //     不支持响应式数据
  // 所有这种做法在服务端渲染中是不会工作的！！！
  async mounted () {
    return this.getPosts()
  }
}
</script>

<style>

</style>
