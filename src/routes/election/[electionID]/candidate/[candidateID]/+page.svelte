<script lang="ts">
  import { Markdown } from "carta-md"
  import { getCandidateCoverImage } from "$lib/client/election"
  import { carta } from "$lib/client/carta"
  let { data } = $props()

  let coverImgSrc = $state(getCandidateCoverImage(data.election.id, data.candidate.id))
</script>

<div class="candidate-page">
  <div class="candidate-page-content" style="flex-grow: 0">
    <img id="cover-image" src={coverImgSrc} alt="Candidate Portrait" />
    <h1>{data.candidate.name}</h1>
    Members:
    <ul>
      {#each data.candidate.users as user}
        <li>
          {user.name}
        </li>
      {/each}
    </ul>
    <br />
    Running for
    <ul>
      {#each data.candidate.roles as role}
        <li>
          {role.name}
        </li>
      {/each}
    </ul>
  </div>

  <div class="candidate-page-content">
    <Markdown {carta} value={data.candidate.description} />
  </div>
</div>

<style>
  #cover-image {
    width: 250px;
  }
  .candidate-page {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    > .candidate-page-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
  }
</style>
